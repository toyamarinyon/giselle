"use client";

import { type StreamableValue, readStreamableValue } from "ai/rsc";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useState,
} from "react";
import {
	createArtifactId,
	createExecutionId,
	createJobExecutionId,
	createStepExecutionId,
	toErrorWithMessage,
} from "../lib/utils";
import type {
	ArtifactId,
	Execution,
	ExecutionId,
	FlowId,
	JobExecution,
	NodeId,
	StepId,
	TextArtifactObject,
} from "../types";
import { useGraph } from "./graph";
import { usePlaygroundMode } from "./playground-mode";
import { usePropertiesPanel } from "./properties-panel";
import { useToast } from "./toast";

interface ExecutionContextType {
	execution: Execution | null;
	execute: (nodeId: NodeId) => Promise<void>;
	executeFlow: (flowId: FlowId) => Promise<void>;
}

const ExecutionContext = createContext<ExecutionContextType | undefined>(
	undefined,
);

interface ExecutionProviderProps {
	children: ReactNode;
	executeAction: (
		artifactId: ArtifactId,
		nodeId: NodeId,
	) => Promise<StreamableValue<TextArtifactObject, unknown>>;
	executeStepAction: (
		flowId: FlowId,
		executionId: ExecutionId,
		stepId: StepId,
	) => Promise<StreamableValue<TextArtifactObject, unknown>>;
}

export function ExecutionProvider({
	children,
	executeAction,
	executeStepAction,
}: ExecutionProviderProps) {
	const { dispatch, flush, graph } = useGraph();
	const { setTab } = usePropertiesPanel();
	const { addToast } = useToast();
	const { setPlaygroundMode } = usePlaygroundMode();
	const [execution, setExecution] = useState<Execution | null>(null);

	const execute = useCallback(
		async (nodeId: NodeId) => {
			const artifactId = createArtifactId();
			dispatch({
				type: "upsertArtifact",
				input: {
					nodeId,
					artifact: {
						id: artifactId,
						type: "streamArtifact",
						creatorNodeId: nodeId,
						object: {
							type: "text",
							title: "",
							content: "",
							messages: {
								plan: "",
								description: "",
							},
						},
					},
				},
			});
			setTab("Result");
			await flush();
			try {
				const stream = await executeAction(artifactId, nodeId);

				let textArtifactObject: TextArtifactObject = {
					type: "text",
					title: "",
					content: "",
					messages: {
						plan: "",
						description: "",
					},
				};
				for await (const streamContent of readStreamableValue(stream)) {
					if (streamContent === undefined) {
						continue;
					}
					dispatch({
						type: "upsertArtifact",
						input: {
							nodeId,
							artifact: {
								id: artifactId,
								type: "streamArtifact",
								creatorNodeId: nodeId,
								object: streamContent,
							},
						},
					});
					textArtifactObject = {
						...textArtifactObject,
						...streamContent,
					};
				}
				dispatch({
					type: "upsertArtifact",
					input: {
						nodeId,
						artifact: {
							id: artifactId,
							type: "generatedArtifact",
							creatorNodeId: nodeId,
							createdAt: Date.now(),
							object: textArtifactObject,
						},
					},
				});
			} catch (error) {
				addToast({
					type: "error",
					title: "Execution failed",
					message: toErrorWithMessage(error).message,
				});
				dispatch({
					type: "upsertArtifact",
					input: {
						nodeId,
						artifact: null,
					},
				});
			}
		},
		[executeAction, dispatch, flush, setTab, addToast],
	);

	const executeFlow = useCallback(
		async (flowId: FlowId) => {
			const flow = graph.flows.find((flow) => flow.id === flowId);
			if (flow === undefined) {
				throw new Error("Flow not found");
			}
			setPlaygroundMode("viewer");
			const executionId = createExecutionId();
			const jobExecutions: JobExecution[] = flow.jobs.map((job) => ({
				id: createJobExecutionId(),
				jobId: job.id,
				status: "pending",
				stepExecutions: job.steps.map((step) => ({
					id: createStepExecutionId(),
					stepId: step.id,
					nodeId: step.nodeId,
					status: "pending",
				})),
			}));
			const flowRunStartedAt = Date.now();
			let flowDurationMs = 0;
			setExecution({
				id: executionId,
				status: "running",
				runStartedAt: flowRunStartedAt,
				flowId,
				jobExecutions,
				artifacts: [],
			});
			for (const currentJobExecution of jobExecutions) {
				const jobRunStartedAt = Date.now();
				setExecution((prev) => {
					if (prev === null) {
						return null;
					}
					return {
						...prev,
						jobExecutions: prev.jobExecutions.map((jobExecution) => {
							if (jobExecution.id !== currentJobExecution.id) {
								return jobExecution;
							}
							return {
								...jobExecution,
								status: "running",
								runStartedAt: jobRunStartedAt,
							};
						}),
					};
				});
				let jobDurationMs = 0;
				await Promise.all(
					currentJobExecution.stepExecutions.map(
						async (currentStepExecution) => {
							const stepRunStartedAt = Date.now();
							const artifactId = createArtifactId();
							let textArtifactObject: TextArtifactObject = {
								type: "text",
								title: "",
								content: "",
								messages: {
									plan: "",
									description: "",
								},
							};
							setExecution((prev) => {
								if (prev === null) {
									return null;
								}
								return {
									...prev,
									jobExecutions: prev.jobExecutions.map((jobExecution) => {
										if (jobExecution.id !== currentJobExecution.id) {
											return jobExecution;
										}
										return {
											...jobExecution,
											stepExecutions: jobExecution.stepExecutions.map(
												(stepExecution) => {
													if (stepExecution.id !== currentStepExecution.id) {
														return stepExecution;
													}
													return {
														...stepExecution,
														status: "running",
														runStartedAt: stepRunStartedAt,
													};
												},
											),
										};
									}),
									artifacts:
										prev.status === "pending"
											? [
													{
														id: artifactId,
														type: "streamArtifact",
														creatorNodeId: currentStepExecution.nodeId,
														object: textArtifactObject,
													},
												]
											: [
													...prev.artifacts,
													{
														id: artifactId,
														type: "streamArtifact",
														creatorNodeId: currentStepExecution.nodeId,
														object: textArtifactObject,
													},
												],
								};
							});
							const stream = await executeStepAction(
								flowId,
								executionId,
								currentStepExecution.stepId,
							);

							for await (const streamContent of readStreamableValue(stream)) {
								if (streamContent === undefined) {
									continue;
								}
								textArtifactObject = {
									...textArtifactObject,
									...streamContent,
								};
								setExecution((prev) => {
									if (prev === null || prev.status !== "running") {
										return null;
									}
									return {
										...prev,
										artifacts: prev.artifacts.map((artifact) => {
											if (artifact.id !== artifactId) {
												return artifact;
											}
											return {
												...artifact,
												object: textArtifactObject,
											};
										}),
									};
								});
							}
							const stepDurationMs = Date.now() - stepRunStartedAt;
							setExecution((prev) => {
								if (prev === null || prev.status !== "running") {
									return null;
								}
								return {
									...prev,
									jobExecutions: prev.jobExecutions.map((jobExecution) => {
										if (jobExecution.id !== currentJobExecution.id) {
											return jobExecution;
										}
										return {
											...jobExecution,
											stepExecutions: jobExecution.stepExecutions.map(
												(stepExecution) => {
													if (stepExecution.id !== currentStepExecution.id) {
														return stepExecution;
													}
													return {
														...stepExecution,
														status: "completed",
														runStartedAt: stepRunStartedAt,
														durationMs: stepDurationMs,
													};
												},
											),
										};
									}),
									artifacts: prev.artifacts.map((artifact) => {
										if (artifact.id !== artifactId) {
											return artifact;
										}
										return {
											id: artifactId,
											type: "generatedArtifact",
											creatorNodeId: currentStepExecution.nodeId,
											createdAt: Date.now(),
											object: textArtifactObject,
										};
									}),
								};
							});
							jobDurationMs += stepDurationMs;
						},
					),
				);
				setExecution((prev) => {
					if (prev === null) {
						return null;
					}
					return {
						...prev,
						jobExecutions: prev.jobExecutions.map((jobExecution) => {
							if (jobExecution.id !== currentJobExecution.id) {
								return jobExecution;
							}
							return {
								...jobExecution,
								status: "completed",
								runStartedAt: jobRunStartedAt,
								durationMs: jobDurationMs,
							};
						}),
					};
				});
				flowDurationMs += jobDurationMs;
			}
			setExecution((prev) => {
				if (prev === null || prev.status !== "running") {
					return null;
				}
				return {
					...prev,
					status: "completed",
					runStartedAt: flowRunStartedAt,
					durationMs: flowDurationMs,
					resultArtifact: prev.artifacts[prev.artifacts.length - 1],
				};
			});
		},
		[setPlaygroundMode, graph.flows, executeStepAction],
	);
	return (
		<ExecutionContext.Provider value={{ execution, execute, executeFlow }}>
			{children}
		</ExecutionContext.Provider>
	);
}

export function useExecution() {
	const context = useContext(ExecutionContext);
	if (!context) {
		throw new Error("useExecution must be used within an ExecutionProvider");
	}
	return context;
}
