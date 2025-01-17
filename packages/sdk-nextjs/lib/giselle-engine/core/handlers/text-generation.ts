import { NodeId, WorkspaceId } from "@/lib/giselle-data";
import { isTextGenerationNode } from "@/lib/giselle-data/node/actions/text-generation";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import { createContextMapFrom, createContextProviderTool } from "../../tools";
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
	const contextMap = createContextMapFrom(node, workspace.nodeMap);
	const system =
		contextMap.size === 0
			? ""
			: `first, check the sources: ${Array.from(contextMap.keys()).join(",")} then, achieve the user request`;
	const stream = streamText({
		model: openai("gpt-4o"),
		prompt: input.prompt,
		system,
		tools: { ...createContextProviderTool(contextMap) },
		maxSteps: 10,
	});
	return stream;
}
