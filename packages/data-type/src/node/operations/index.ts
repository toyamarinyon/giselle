import { z } from "zod";
import { NodeBase, NodeReferenceBase, OverrideNodeBase } from "../base";
import {
	ImageGenerationContent,
	ImageGenerationContentReference,
	OverrideImageGenerationContent,
} from "./image-generation";
import {
	OverrideTextGenerationContent,
	TextGenerationContent,
	TextGenerationContentReference,
} from "./text-generation";
import { TriggerContent, TriggerContentReference } from "./trigger";
export * from "./image-generation";
export * from "./text-generation";
export * from "./trigger";

const OperationNodeContent = z.discriminatedUnion("type", [
	TextGenerationContent,
	ImageGenerationContent,
	TriggerContent,
]);

export const OperationNode = NodeBase.extend({
	type: z.literal("operation"),
	content: OperationNodeContent,
});
export type OperationNode = z.infer<typeof OperationNode>;

export function isOperationNode(node: NodeBase): node is OperationNode {
	return node.type === "operation";
}

export const TextGenerationNode = OperationNode.extend({
	type: z.literal("operation"),
	content: TextGenerationContent,
});
type TextGenerationNode = z.infer<typeof TextGenerationNode>;

export function isTextGenerationNode(
	args?: unknown,
): args is TextGenerationNode {
	const result = TextGenerationNode.safeParse(args);
	return result.success;
}

export const ImageGenerationNode = OperationNode.extend({
	content: ImageGenerationContent,
});
type ImageGenerationNode = z.infer<typeof ImageGenerationNode>;

export function isImageGenerationNode(
	args?: unknown,
): args is ImageGenerationNode {
	const result = ImageGenerationNode.safeParse(args);
	return result.success;
}

export const TriggerNode = OperationNode.extend({
	content: TriggerContent,
});
export type TriggerNode = z.infer<typeof TriggerNode>;

const OverrideOperationNodeContent = z.discriminatedUnion("type", [
	OverrideTextGenerationContent,
	OverrideImageGenerationContent,
]);
export const OverrideOperationNode = OverrideNodeBase.extend({
	type: OperationNode.shape.type,
	content: OverrideOperationNodeContent,
});
export type OverrideOperationNode = z.infer<typeof OverrideOperationNode>;

const OperationNodeContentReference = z.discriminatedUnion("type", [
	TextGenerationContentReference,
	ImageGenerationContentReference,
	TriggerContentReference,
]);
export const OperationNodeReference = NodeReferenceBase.extend({
	type: OperationNode.shape.type,
	content: OperationNodeContentReference,
});
export type OperationNodeReference = z.infer<typeof OperationNodeReference>;
