"use client";

import { type StreamableValue, readStreamableValue } from "ai/rsc";
import { type ReactNode, createContext, useCallback, useContext } from "react";
import { createArtifactId, toErrorWithMessage } from "../lib/utils";
import type { ArtifactId, NodeId, TextArtifactObject } from "../types";
import { useGraph } from "./graph";
import { usePropertiesPanel } from "./properties-panel";
import { useToast } from "./toast";

interface ExecutionContextType {
	execute: (nodeId: NodeId) => Promise<void>;
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
}

export function ExecutionProvider({
	children,
	executeAction,
}: ExecutionProviderProps) {
	const { dispatch, flush } = useGraph();
	const { setTab } = usePropertiesPanel();
	const { addToast } = useToast();
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
	return (
		<ExecutionContext.Provider value={{ execute }}>
			{children}
		</ExecutionContext.Provider>
	);
}

export function useExecution() {
	const context = useContext(ExecutionContext);
	if (!context) {
		throw new Error("useExecution must be used within an ExecutionProvider");
	}
	return context.execute;
}
