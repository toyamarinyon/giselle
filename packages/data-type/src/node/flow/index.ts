import { z } from "zod";
import { Flow } from "../../flow";
import { NodeBase } from "../base";

export const FlowNode = NodeBase.extend({
	type: z.literal("flow"),
	content: Flow,
});
export type FlowNode = z.infer<typeof FlowNode>;
