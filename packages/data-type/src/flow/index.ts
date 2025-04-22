import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod";
import { NodeId } from "../node";

export const FlowId = createIdGenerator("flw");
export type FlowId = z.infer<typeof FlowId.schema>;

export const Flow = z.object({
	id: FlowId.schema,
	// Node id for representating on builder
	nodeId: NodeId.schema,
	name: z.string().optional(),
	childNodeIds: z.array(NodeId.schema),
});
export type Flow = z.infer<typeof Flow>;
