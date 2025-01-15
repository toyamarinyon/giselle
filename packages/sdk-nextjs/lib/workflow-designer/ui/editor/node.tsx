import { TextGenerationNodeData, TextNodeData } from "@/lib/workflow-data";
import type { Node, NodeProps, NodeTypes } from "@xyflow/react";

type GiselleWorkflowDesignerTextGenerationNode = Node<
	TextGenerationNodeData,
	TextGenerationNodeData["content"]["type"]
>;
type GiselleWorkflowDesignerTextNode = Node<
	TextNodeData,
	TextNodeData["content"]["type"]
>;
type GiselleWorkflowDesignerNode =
	| GiselleWorkflowDesignerTextGenerationNode
	| GiselleWorkflowDesignerTextNode;

export const nodeTypes: NodeTypes = {
	[TextGenerationNodeData.shape.content.shape.type._def.value]: CustomNode,
	[TextNodeData.shape.content.shape.type._def.value]: CustomNode,
};

function CustomNode({ data, type }: NodeProps<GiselleWorkflowDesignerNode>) {
	return (
		<div>
			{type},{data.name}
		</div>
	);
}
