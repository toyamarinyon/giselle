import {
	type NodeData,
	NodeId,
	type TextGenerationNodeData,
} from "@/lib/giselle-data";
import { tool } from "ai";
import { z } from "zod";

type ContextMap = Map<NodeId, NodeData>;
export function createContextMapFrom(
	node: TextGenerationNodeData,
	nodeMap: Map<NodeId, NodeData>,
) {
	const contextMap = new Map<NodeId, NodeData>();
	for (const sourceConnectionHandle of node.content.sources) {
		const sourceNode = nodeMap.get(sourceConnectionHandle.connectedNodeId);
		if (sourceNode !== undefined) {
			contextMap.set(sourceNode.id, sourceNode);
		}
	}
	return contextMap;
}

export function createContextProviderTool(contextMap: ContextMap) {
	if (contextMap.size === 0) {
		return null;
	}
	return {
		contextProvider: tool({
			description: `Provide context that need to archieve user request. You can get following contextNodeIds: ${Array.from(contextMap.keys()).join(",")}`,
			parameters: z.object({
				contextNodeId: NodeId.schema,
			}),
			execute: async ({ contextNodeId }) => {
				const contextNode = contextMap.get(contextNodeId);
				if (contextNode === undefined) {
					console.warn(`ContextNode: ${contextNodeId} not found`);
					return "";
				}
				if (contextNode.content.type === "textGeneration") {
					return contextNode.content.generatedText;
				}
				return contextNode;
			},
		}),
	};
}
