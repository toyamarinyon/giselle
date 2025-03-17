import type { Message } from "@ai-sdk/react";
import {
	type CancelledGeneration,
	type CompletedGeneration,
	type CreatedGeneration,
	type FailedGeneration,
	type Generation,
	type GenerationContext,
	GenerationId,
	type GenerationOrigin,
	type NodeId,
	type QueuedGeneration,
	type RunningGeneration,
} from "@giselle-sdk/data-type";
import { useGiselleEngine } from "@giselle-sdk/giselle-engine/react";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	arrayEquals,
	waitAndGetGenerationCompleted,
	waitAndGetGenerationFailed,
	waitAndGetGenerationRunning,
} from "../../helpers";
import { GenerationRunner } from "../generation-runner";

interface StartGenerationOptions {
	onGenerationCreated?: (generation: CreatedGeneration) => void;
	onGenerationQueued?: (generation: QueuedGeneration) => void;
	onGenerationStarted?: (generation: RunningGeneration) => void;
	onGenerationCompleted?: (generation: CompletedGeneration) => void;
	onGenerationCancelled?: (generation: CancelledGeneration) => void;
	onUpdateMessages?: (generation: RunningGeneration) => void;
}
export type StartGeneration = (
	generationContext: GenerationContext,
	options?: StartGenerationOptions,
) => Promise<void>;

export interface FetchNodeGenerationsParams {
	nodeId: NodeId;
	origin: GenerationOrigin;
}
type FetchNodeGenerations = (
	params: FetchNodeGenerationsParams,
) => Promise<void>;

interface GenerationRunnerSystemContextType {
	generateTextApi: string;
	startGeneration: StartGeneration;
	getGeneration: (generationId: GenerationId) => Generation | undefined;
	generations: Generation[];
	nodeGenerationMap: Map<NodeId, Generation[]>;
	updateGenerationStatusToRunning: (
		generationId: GenerationId,
	) => Promise<
		| RunningGeneration
		| CompletedGeneration
		| FailedGeneration
		| CancelledGeneration
	>;
	updateGenerationStatusToComplete: (
		generationId: GenerationId,
	) => Promise<CompletedGeneration>;
	updateGenerationStatusToFailure: (
		generationId: GenerationId,
	) => Promise<FailedGeneration>;
	updateMessages: (generationId: GenerationId, newMessages: Message[]) => void;
	fetchNodeGenerations: FetchNodeGenerations;
	addStopHandler: (generationId: GenerationId, handler: () => void) => void;
	stopGeneration: (generationId: GenerationId) => Promise<void>;
}

export const GenerationRunnerSystemContext =
	createContext<GenerationRunnerSystemContextType | null>(null);

interface GenerationRunnerSystemProviderProps {
	children: ReactNode;
	generateTextApi?: string;
}
export function GenerationRunnerSystemProvider({
	children,
	generateTextApi = "/api/giselle/generateText",
}: GenerationRunnerSystemProviderProps) {
	const client = useGiselleEngine();
	const [generations, setGenerations] = useState<Generation[]>([]);
	const [stopHandlers, setStopHandlers] = useState<
		Record<GenerationId, () => void>
	>({});
	const generationListener = useRef<Record<GenerationId, Generation>>({});

	const nodeGenerationMap = useMemo(() => {
		const tmp = new Map<NodeId, Generation[]>();
		for (const generation of generations) {
			if (generation.status === "created") {
				continue;
			}
			const generations = tmp.get(generation.context.actionNode.id) || [];
			generations.push(generation);
			tmp.set(
				generation.context.actionNode.id,
				generations.sort((a, b) => a.createdAt - b.createdAt),
			);
		}
		return tmp;
	}, [generations]);

	const waitForGeneration = useCallback(
		async (
			generationId: GenerationId,
			options?: {
				timeout?: number;
				onStart?: (generation: RunningGeneration) => void;
				onComplete?: (generation: CompletedGeneration) => void;
				onError?: (generation: FailedGeneration) => void;
				onCancel?: (generation: CancelledGeneration) => void;
				onUpdateMessages?: (generation: RunningGeneration) => void;
			},
		) => {
			let status = generationListener.current[generationId].status;
			const messages = generationListener.current[generationId].messages;
			const timeoutDuration = options?.timeout || 1000 * 60 * 5;
			const startTime = Date.now();

			while (true) {
				if (Date.now() - startTime > timeoutDuration) {
					throw new Error("Generation timeout");
				}

				const generation = generationListener.current[generationId];
				if (status !== generation.status) {
					status = generation.status;
					if (generation.status === "running") {
						options?.onStart?.(generation);
					}
					if (generation.status === "completed") {
						options?.onComplete?.(generation);
						return generation;
					}
					if (generation.status === "failed") {
						options?.onError?.(generation);
						return generation;
					}
					if (generation.status === "cancelled") {
						options?.onCancel?.(generation);
						return generation;
					}
				}
				if (
					!arrayEquals(messages, generation.messages) &&
					generation.status === "running"
				) {
					options?.onUpdateMessages?.(generation);
				}

				// Add small delay between checks
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		},
		[],
	);
	const startGeneration = useCallback<StartGeneration>(
		async (generationContext, options = {}) => {
			const generationId = GenerationId.generate();
			const createdGeneration = {
				id: generationId,
				context: generationContext,
				status: "created",
				createdAt: Date.now(),
			} satisfies CreatedGeneration;
			setGenerations((prev) => [...prev, createdGeneration]);
			generationListener.current[createdGeneration.id] = createdGeneration;
			options?.onGenerationCreated?.(createdGeneration);

			/** @todo split create and start */

			const queuedGeneration = {
				...createdGeneration,
				status: "queued",
				ququedAt: Date.now(),
			} satisfies QueuedGeneration;
			options.onGenerationQueued?.(queuedGeneration);
			setGenerations((prev) =>
				prev.map((prevGeneration) =>
					prevGeneration.id === generationId
						? queuedGeneration
						: prevGeneration,
				),
			);
			await waitForGeneration(createdGeneration.id, {
				onStart: options?.onGenerationStarted,
				onComplete: options?.onGenerationCompleted,
				onUpdateMessages: options?.onUpdateMessages,
				onCancel: options?.onGenerationCancelled,
			});
		},
		[waitForGeneration],
	);
	const getGeneration = useCallback(
		(generationId: GenerationId) =>
			generations.find((generation) => generation.id === generationId),
		[generations],
	);
	const updateMessages = useCallback(
		(updateGenerationId: GenerationId, newMessages: Message[]) => {
			setGenerations((prevGenerations) =>
				prevGenerations.map((prevGeneration) =>
					prevGeneration.id === updateGenerationId &&
					prevGeneration.status === "running"
						? { ...prevGeneration, messages: newMessages }
						: prevGeneration,
				),
			);

			const currentGeneration = generationListener.current[updateGenerationId];
			generationListener.current[updateGenerationId] = {
				...currentGeneration,
				messages: newMessages,
			} as RunningGeneration;
		},
		[],
	);
	const updateGenerationStatusToRunning = useCallback(
		async (generationId: GenerationId) => {
			const generation = await waitAndGetGenerationRunning(
				(generationId) => client.getGeneration({ generationId }),
				generationId,
			);
			setGenerations((prevGenerations) =>
				prevGenerations.map((prevGeneration) =>
					prevGeneration.id !== generation.id ? prevGeneration : generation,
				),
			);
			generationListener.current[generationId] = generation;
			return generation;
		},
		[client],
	);
	const updateGenerationStatusToComplete = useCallback(
		async (generationId: GenerationId) => {
			const completedGeneration = await waitAndGetGenerationCompleted(
				(generationId) => client.getGeneration({ generationId }),
				generationId,
			);
			setGenerations((prevGenerations) =>
				prevGenerations.map((prevGeneration) =>
					prevGeneration.id !== completedGeneration.id
						? prevGeneration
						: completedGeneration,
				),
			);
			generationListener.current[generationId] = completedGeneration;
			return completedGeneration;
		},
		[client],
	);

	const updateGenerationStatusToFailure = useCallback(
		async (generationId: GenerationId) => {
			const failedGeneration = await waitAndGetGenerationFailed(
				(generationId) => client.getGeneration({ generationId }),
				generationId,
			);
			setGenerations((prevGenerations) =>
				prevGenerations.map((prevGeneration) =>
					prevGeneration.id !== failedGeneration.id
						? prevGeneration
						: failedGeneration,
				),
			);
			generationListener.current[generationId] = failedGeneration;
			return failedGeneration;
		},
		[client],
	);

	const fetchNodeGenerations = useCallback<FetchNodeGenerations>(
		async ({
			nodeId,
			origin,
		}: { nodeId: NodeId; origin: GenerationOrigin }) => {
			const generations = await client.getNodeGenerations({
				origin,
				nodeId,
			});
			const excludeCancelled = generations.filter(
				(generation) => generation.status !== "cancelled",
			);
			setGenerations((prev) => {
				const filtered = prev.filter(
					(p) => !excludeCancelled.some((g) => g.id === p.id),
				);
				return [...filtered, ...excludeCancelled].sort(
					(a, b) => a.createdAt - b.createdAt,
				);
			});
		},
		[client],
	);

	const addStopHandler = useCallback(
		(generationId: GenerationId, handler: () => void) => {
			setStopHandlers((prev) => ({ ...prev, [generationId]: handler }));
		},
		[],
	);

	const stopGeneration = useCallback(
		async (generationId: GenerationId) => {
			const handler = stopHandlers[generationId];
			if (handler) {
				handler();
				setGenerations((prevGenerations) =>
					prevGenerations.map((prevGeneration) => {
						if (prevGeneration.id !== generationId) {
							return prevGeneration;
						}
						return {
							...prevGeneration,
							status: "cancelled",
							cancelledAt: Date.now(),
						} as CancelledGeneration;
					}),
				);
				await client.cancelGeneration({
					generationId,
				});
			}

			const currentGeneration = generationListener.current[generationId];
			generationListener.current[generationId] = {
				...currentGeneration,
				status: "cancelled",
				cancelledAt: Date.now(),
			} as CancelledGeneration;
		},
		[stopHandlers, client],
	);

	return (
		<GenerationRunnerSystemContext.Provider
			value={{
				generateTextApi,
				startGeneration,
				getGeneration,
				generations,
				updateGenerationStatusToRunning,
				updateGenerationStatusToComplete,
				updateGenerationStatusToFailure,
				updateMessages,
				nodeGenerationMap,
				fetchNodeGenerations,
				addStopHandler,
				stopGeneration,
			}}
		>
			{children}
			{generations.map((generation) => (
				<GenerationRunner key={generation.id} generation={generation} />
			))}
		</GenerationRunnerSystemContext.Provider>
	);
}

export function useGenerationRunnerSystem() {
	const context = useContext(GenerationRunnerSystemContext);
	if (!context) {
		throw new Error(
			"useGenerationRunner must be used within a GenerationRunnerProvider",
		);
	}
	return context;
}
