import { z } from "zod";
import { BaseNodeData } from "../types";
import { TextContent } from "./text";

const VariableNodeContentData = z.discriminatedUnion("type", [TextContent]);

export const VariableNodeData = BaseNodeData.extend({
	type: z.literal("variable"),
	content: VariableNodeContentData,
});

export const TextNodeData = VariableNodeData.extend({
	content: TextContent,
});
export type TextNodeData = z.infer<typeof TextNodeData>;
