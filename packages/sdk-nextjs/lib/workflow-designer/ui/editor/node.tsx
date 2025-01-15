import { TextGenerationNodeData, TextNodeData } from "@/lib/workflow-data";
import type { Node, NodeProps, NodeTypes } from "@xyflow/react";
import clsx from "clsx/lite";
import { useMemo } from "react";
import { NodeHeader } from "./node/node-header";

type GiselleWorkflowDesignerTextGenerationNode = Node<
	{ nodeData: TextGenerationNodeData },
	TextGenerationNodeData["content"]["type"]
>;
type GiselleWorkflowDesignerTextNode = Node<
	{ nodeData: TextNodeData },
	TextNodeData["content"]["type"]
>;
type GiselleWorkflowDesignerNode =
	| GiselleWorkflowDesignerTextGenerationNode
	| GiselleWorkflowDesignerTextNode;

export const nodeTypes: NodeTypes = {
	[TextGenerationNodeData.shape.content.shape.type._def.value]: CustomNode,
	[TextNodeData.shape.content.shape.type._def.value]: CustomNode,
};

function CustomNode({
	data,
	type,
	selected,
}: NodeProps<GiselleWorkflowDesignerNode>) {
	const targetHandles = useMemo(() => {
		if (data.nodeData.content.type !== "textGeneration") {
			return [];
		}
		return [
			data.nodeData.content.requirement,
			...data.nodeData.content.sources,
		].filter((item) => item !== undefined);
	}, [data]);
	return (
		<div
			data-type={data.nodeData.type}
			data-selected={selected}
			className={clsx(
				"group relative rounded-[16px] bg-gradient-to-tl min-w-[180px] backdrop-blur-[1px] transition-shadow",
				"data-[type=action]:from-[hsla(187,79%,54%,0.2)] data-[type=action]:to-[hsla(207,100%,9%,0.2)]",
				"data-[type=variable]:from-[hsla(0,0%,91%,0.2)] data-[type=variable]:to-[hsla(0,0%,16%,0.2)]",
				"data-[selected=true]:shadow-[0px_0px_16px_0px_hsla(187,_79%,_54%,_0.5)]",
				"data-[preview=true]:opacity-50",
			)}
		>
			<div
				className={clsx(
					"absolute z-0 rounded-[16px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent",
					"group-data-[type=action]:from-[hsla(187,79%,54%,1)] group-data-[type=action]:to-[hsla(187,68%,30%,1)]",
					"group-data-[type=variable]:from-[hsla(0,0%,91%,1)] group-data-[type=variable]:to-[hsla(0,0%,35%,1)]",
				)}
			/>
			<div
				className={clsx(
					"py-[12px] rounded-t-[16px]",
					"group-data-[type=action]:bg-[hsla(187,71%,48%,0.3)]",
					"group-data-[type=variable]:bg-[hsla(0,0%,93%,0.3)]",
				)}
			>
				{data.nodeData.content.type === "textGeneration" && (
					<NodeHeader name="Text Generator" contentType={"textGeneration"} />
				)}
				{data.nodeData.content.type === "text" && (
					<NodeHeader name="Text" contentType="text" />
				)}
				{/* {data.nodeData.content.type === "file" && (
					<NodeHeader name="File" contentType="file" />
				)}
				{data.nodeData.content.type === "files" && (
					<NodeHeader name="File" contentType="file" />
				)} */}
			</div>
			<div className="py-[4px] min-h-[30px]">
				<div className="flex justify-between h-full"></div>
			</div>
		</div>
	);
}
