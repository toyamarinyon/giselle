import { z } from "zod";
import { ActionNodeData } from "./actions";
import { VariableNodeData } from "./variables";
export * from "./types";

export const NodeData = z.discriminatedUnion("type", [
	ActionNodeData,
	VariableNodeData,
]);
export type NodeData = z.infer<typeof NodeData>;
