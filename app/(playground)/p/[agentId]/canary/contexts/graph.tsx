"use client";

import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import { deriveFlows } from "../lib/graph";
import type {
	Artifact,
	Connection,
	ConnectionId,
	ExecutionIndex,
	Graph,
	Node,
	NodeHandleId,
	NodeId,
	Position,
} from "../types";

interface UpsertArtifactActionInput {
	nodeId: NodeId;
	artifact: Artifact | null;
}
interface UpsertArtifactAction {
	type: "upsertArtifact";
	input: UpsertArtifactActionInput;
}

interface UpdateNodeActionInput {
	nodeId: NodeId;
	node: Node;
}
interface UpdateNodeAction {
	type: "updateNode";
	input: UpdateNodeActionInput;
}

interface UpdateNodePositionActionInput {
	nodeId: NodeId;
	position: Position;
}
interface UpdateNodePositionAction {
	type: "updateNodePosition";
	input: UpdateNodePositionActionInput;
}
interface UpdateNodeSelectionActionInput {
	nodeId: NodeId;
	selected: boolean;
}
interface UpdateNodeSelectionAction {
	type: "updateNodeSelection";
	input: UpdateNodeSelectionActionInput;
}

interface AddConnectionActionInput {
	connection: Connection;
}
interface AddConnectionAction {
	type: "addConnection";
	input: AddConnectionActionInput;
}
interface RemoveConnectionActionInput {
	connectionId: ConnectionId;
}
interface RemoveConnectionAction {
	type: "removeConnection";
	input: RemoveConnectionActionInput;
}

interface AddNodeActionInput {
	node: Node;
}
interface AddNodeAction {
	type: "addNode";
	input: AddNodeActionInput;
}
interface RemoveNoeActionInput {
	nodeId: NodeId;
}
interface RemoveNodeAction {
	type: "removeNode";
	input: RemoveNoeActionInput;
}

interface AddExecutionIndexAction {
	type: "addExecutionIndex";
	input: { executionIndex: ExecutionIndex };
}

type GraphAction =
	| UpsertArtifactAction
	| UpdateNodeAction
	| AddConnectionAction
	| RemoveConnectionAction
	| UpdateNodePositionAction
	| UpdateNodeSelectionAction
	| AddNodeAction
	| RemoveNodeAction
	| AddExecutionIndexAction;

type GraphActionOrActions = GraphAction | GraphAction[];

function applyActions(
	graph: Graph,
	actionOrActions: GraphActionOrActions,
): Graph {
	const actions = Array.isArray(actionOrActions)
		? actionOrActions
		: [actionOrActions];
	let currentGraph = graph;
	for (const action of actions) {
		currentGraph = graphReducer(currentGraph, action);
	}
	currentGraph = {
		...currentGraph,
		flows: deriveFlows(currentGraph),
	};
	return currentGraph;
}

interface GraphContextValue {
	graph: Graph;
	graphUrl: string;
	dispatch: (action: GraphActionOrActions) => void;
	/**
	 * Persists the current graph state to the server immediately.
	 * Returns the new graph URL.
	 */
	flush: () => Promise<string>;
}
const GraphContext = createContext<GraphContextValue | undefined>(undefined);

function graphReducer(graph: Graph, action: GraphAction): Graph {
	switch (action.type) {
		case "upsertArtifact":
			if (action.input.artifact === null) {
				return {
					...graph,
					artifacts: [
						...graph.artifacts.filter(
							(artifact) => artifact.creatorNodeId !== action.input.nodeId,
						),
					],
				};
			}
			return {
				...graph,
				artifacts: [
					...graph.artifacts.filter(
						(artifact) => artifact.creatorNodeId !== action.input.nodeId,
					),
					action.input.artifact,
				],
			};
		case "updateNode":
			return {
				...graph,
				nodes: graph.nodes.map((node) =>
					node.id === action.input.nodeId ? action.input.node : node,
				),
			};
		case "addConnection":
			return {
				...graph,
				connections: [...graph.connections, action.input.connection],
			};
		case "removeConnection":
			return {
				...graph,
				connections: graph.connections.filter(
					(connection) => connection.id !== action.input.connectionId,
				),
			};
		case "updateNodePosition":
			return {
				...graph,
				nodes: graph.nodes.map((node) =>
					node.id === action.input.nodeId
						? { ...node, position: action.input.position }
						: node,
				),
			};
		case "updateNodeSelection":
			return {
				...graph,
				nodes: graph.nodes.map((node) =>
					node.id === action.input.nodeId
						? { ...node, selected: action.input.selected }
						: node,
				),
			};
		case "addNode":
			return {
				...graph,
				nodes: [...graph.nodes, action.input.node],
			};

		case "removeNode":
			return {
				...graph,
				nodes: graph.nodes.filter((node) => node.id !== action.input.nodeId),
			};
		case "addExecutionIndex":
			return {
				...graph,
				executionIndexes: [
					...graph.executionIndexes,
					action.input.executionIndex,
				],
			};
		default:
			return graph;
	}
}

export function GraphContextProvider({
	children,
	defaultGraph,
	defaultGraphUrl,
	onPersistAction,
	testServerAction,
}: {
	children: ReactNode;
	defaultGraph: Graph;
	defaultGraphUrl: string;
	/**
	 * Persists the graph to the server.
	 * Returns the new graph URL.
	 */
	onPersistAction: (graph: Graph) => Promise<string>;
	testServerAction: (n: string) => Promise<string>;
}) {
	const graphRef = useRef(defaultGraph);
	const [graph, setGraph] = useState(graphRef.current);
	const [graphUrl, setGraphUrl] = useState(defaultGraphUrl);
	const persistTimeoutRef = useRef<Timer | null>(null);
	const isPendingPersistRef = useRef(false);
	const persist = useCallback(async () => {
		isPendingPersistRef.current = false;
		try {
			const newGraphUrl = await onPersistAction(graphRef.current);
			setGraphUrl(newGraphUrl);
			return newGraphUrl;
		} catch (error) {
			console.error("Failed to persist graph:", error);
			return graphUrl;
		}
	}, [onPersistAction, graphUrl]);

	const flush = useCallback(async () => {
		if (persistTimeoutRef.current) {
			clearTimeout(persistTimeoutRef.current);
			persistTimeoutRef.current = null;
		}
		return await persist();
	}, [persist]);

	const dispatch = useCallback(
		async (actionOrActions: GraphActionOrActions) => {
			graphRef.current = applyActions(graphRef.current, actionOrActions);
			setGraph(graphRef.current);
			persist();

			isPendingPersistRef.current = true;

			if (persistTimeoutRef.current) {
				clearTimeout(persistTimeoutRef.current);
			}

			persistTimeoutRef.current = setTimeout(persist, 500);
		},
		[persist],
	);
	return (
		<GraphContext.Provider value={{ graph, dispatch, flush, graphUrl }}>
			<div className="absolute z-10 top-[20px] left-[20px] bg-white p-12 rounded flex flex-col gap-4">
				<button
					className="rounded bg-black-50 text-white px-4 py-2"
					type="button"
					onClick={async () => {
						await testServerAction("hello");
					}}
				>
					Test Server Action
				</button>
				<button
					className="rounded bg-black-50 text-white px-4 py-2"
					type="button"
					onClick={async () => {
						await onPersistAction(graph);
					}}
				>
					Persist Action
				</button>
			</div>
			{children}
		</GraphContext.Provider>
	);
}

export function useGraph() {
	const context = useContext(GraphContext);
	if (context === undefined) {
		throw new Error("useGraph must be used within a GraphContextProvider");
	}
	return context;
}

interface TargetHandle {
	targetNodeHandleId?: NodeHandleId;
}
export function useNode(query: TargetHandle) {
	const {
		graph: { nodes, connections },
	} = useGraph();
	const node = useMemo(() => {
		const connection = connections.find(
			(connection) =>
				connection.targetNodeHandleId === query.targetNodeHandleId,
		);
		if (connection === undefined) {
			return null;
		}
		const node = nodes.find((node) => node.id === connection.sourceNodeId);
		if (node === undefined) {
			return null;
		}
		return node;
	}, [connections, nodes, query]);
	return node;
}

interface CreatorNode {
	creatorNodeId?: NodeId;
}
export function useArtifact(query: CreatorNode): Artifact | null | undefined {
	const {
		graph: { artifacts },
	} = useGraph();
	const artifact = useMemo(() => {
		const createdArtifacts = artifacts.filter(
			(artifact) => artifact.creatorNodeId === query.creatorNodeId,
		);
		return createdArtifacts[0];
	}, [artifacts, query]);
	return artifact;
}

export function useSelectedNode() {
	const {
		graph: { nodes },
	} = useGraph();
	const selectedNodes = useMemo(
		() => nodes.filter((node) => node.selected),
		[nodes],
	);
	const selectedNode = useMemo(
		() => (selectedNodes.length === 1 ? selectedNodes[0] : null),
		[selectedNodes],
	);
	return selectedNode;
}
