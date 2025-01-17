import {
	type NodeData,
	NodeId,
	type TextGenerationNodeData,
	type Workspace,
	WorkspaceId,
} from "@/lib/giselle-data";
import { isTextGenerationNode } from "@/lib/giselle-data/node/actions/text-generation";
import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { getWorkspace } from "../helpers/get-workspace";
import type { WorkspaceEngineHandlerArgs } from "./types";

export const Data = z.object({
	workspaceId: WorkspaceId.schema,
	nodeId: NodeId.schema,
});
const Input = Data.extend({
	prompt: z.string(),
});
type Input = z.infer<typeof Input>;

function createContextProviderTool(sourceMap: Map<NodeId, NodeData>) {
	if (sourceMap.size === 0) {
		return null;
	}
	return {
		contextProvider: tool({
			description: `Provide context that need to archieve user request. You can get following sourceNodeIds: ${Array.from(sourceMap.keys()).join(",")}`,
			parameters: z.object({
				sourceNodeId: NodeId.schema,
			}),
			execute: async ({ sourceNodeId }) => {
				const sourceNode = sourceMap.get(sourceNodeId);
				if (sourceNode === undefined) {
					console.warn(`SourceNode: ${sourceNodeId} not found`);
					return "";
				}
				if (sourceNode.content.type === "textGeneration") {
					return sourceNode.content.generatedText;
				}
				return sourceNode;
			},
		}),
	};
}

export async function textGeneration({
	unsafeInput,
	context,
}: WorkspaceEngineHandlerArgs<z.infer<typeof Input>>) {
	const input = Input.parse(unsafeInput);
	const workspace = await getWorkspace({
		storage: context.storage,
		workspaceId: input.workspaceId,
	});
	const node = workspace.nodeMap.get(input.nodeId);
	if (node === undefined) {
		throw new Error("Node not found");
	}
	if (!isTextGenerationNode(node)) {
		throw new Error("Node is not a text generation node");
	}
	const sourceMap = new Map<NodeId, NodeData>();
	for (const sourceConnectionHandle of node.content.sources) {
		const sourceNode = workspace.nodeMap.get(
			sourceConnectionHandle.connectedNodeId,
		);
		if (sourceNode !== undefined) {
			sourceMap.set(sourceNode.id, sourceNode);
		}
	}
	const system =
		sourceMap.size === 0
			? ""
			: `first, check the sources: ${Array.from(sourceMap.keys()).join(",")} then, achieve the user request`;
	const stream = streamText({
		model: openai("gpt-4o"),
		prompt: input.prompt,
		system,
		tools: { ...createContextProviderTool(sourceMap) },
		maxSteps: 10,
	});
	return stream;
}
