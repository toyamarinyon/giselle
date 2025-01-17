import { NodeId, WorkspaceId } from "@/lib/giselle-data";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
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
}: WorkspaceEngineHandlerArgs<z.infer<typeof Input>>) {
	const input = Input.parse(unsafeInput);
	const stream = streamText({
		model: openai("gpt-4o"),
		prompt: input.prompt,
	});
	return stream;
}
