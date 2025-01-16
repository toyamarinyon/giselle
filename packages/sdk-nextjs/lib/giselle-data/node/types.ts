import { createIdGenerator } from "@/lib/utils/generate-id";
import { z } from "zod";

export const NodeId = createIdGenerator("nd");
export type NodeId = z.infer<typeof NodeId.schema>;

export const BaseNodeData = z.object({
	id: NodeId.schema,
	name: z.string(),
	type: z.string(),
});
export type BaseNodeData = z.infer<typeof BaseNodeData>;

export const connectionHandleId = createIdGenerator("hndl");
export type ConnectionHandleId = z.infer<typeof connectionHandleId.schema>;

export const Position = z.object({
	x: z.number(),
	y: z.number(),
});

export const ConnectionHandle = z.object({
	id: connectionHandleId.schema,
	nodeId: NodeId.schema,
	nodeType: BaseNodeData.shape.type,
	label: z.string(),
});
export type ConnectionHandle = z.infer<typeof ConnectionHandle>;

export const NodeUIState = z.object({
	position: Position,
	selected: z.boolean().default(false).optional(),
});
export type NodeUIState = z.infer<typeof NodeUIState>;

export const ConnectionId = createIdGenerator("cnnc");
export type ConnectionId = z.infer<typeof ConnectionId.schema>;
export const Connection = z.object({
	id: ConnectionId.schema,
	sourceNodeId: NodeId.schema,
	sourceNodeType: BaseNodeData.shape.type,
	targetNodeId: NodeId.schema,
	targetNodeType: BaseNodeData.shape.type,
	targetNodeHandleId: connectionHandleId.schema,
});
export type Connection = z.infer<typeof Connection>;
