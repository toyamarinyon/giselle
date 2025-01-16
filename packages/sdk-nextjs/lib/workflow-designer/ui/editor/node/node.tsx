import { TextGenerationNodeData, TextNodeData } from "@/lib/workflow-data";
import { useWorkflowDesigner } from "@/lib/workflow-designer/workflow-designer-context";
import {
	Handle,
	type Node,
	type NodeProps,
	type NodeTypes,
	Position,
} from "@xyflow/react";
import clsx from "clsx/lite";
import { useMemo } from "react";
import { NodeHeader } from "./node-header";

type GiselleWorkflowDesignerTextGenerationNode = Node<
	{ nodeData: TextGenerationNodeData; preview?: boolean },
	TextGenerationNodeData["content"]["type"]
>;
type GiselleWorkflowDesignerTextNode = Node<
	{ nodeData: TextNodeData; preview?: boolean },
	TextNodeData["content"]["type"]
>;
export type GiselleWorkflowDesignerNode =
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
	const { data: Workspace } = useWorkflowDesigner();
	const targetHandles = useMemo(() => {
		if (data.nodeData.content.type !== "textGeneration") {
			return [];
		}
		return [
			data.nodeData.content.requirement,
			...data.nodeData.content.sources,
		].filter((item) => item !== undefined);
	}, [data]);
	const hasTarget = useMemo(
		() =>
			Array.from(Workspace.connections).some(
				([_, connection]) => connection.sourceNodeId === data.nodeData.id,
			),
		[Workspace, data.nodeData.id],
	);
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
				<div className="flex justify-between h-full">
					<div className="grid">
						{targetHandles.map((targetHandle) => (
							<div
								className="relative flex items-center h-[28px]"
								key={targetHandle.id}
							>
								<Handle
									type="target"
									position={Position.Left}
									id={targetHandle.id}
									className={clsx(
										"!absolute !w-[6px] !h-[12px] !rounded-l-[12px] !rounded-r-none !top-[50%] !-translate-y-[50%] !-left-[10px]",
										"group-data-[type=action]:!bg-[hsla(187,71%,48%,1)]",
										"group-data-[type=variable]:!bg-[hsla(236,7%,39%,1)]",
									)}
								/>
								<div className="text-[14px] text-black--30 px-[12px]">
									{targetHandle.label}
								</div>
							</div>
						))}
					</div>

					{!data.preview && (
						<div className="grid">
							<div className="relative flex items-center h-[28px]">
								<div className="absolute -right-[10px] translate-x-[6px]">
									<div
										className={clsx(
											"h-[28px] w-[10px]",
											"group-data-[type=action]:bg-[hsla(195,74%,21%,1)]",
											"group-data-[type=variable]:bg-[hsla(236,7%,39%,1)]",
										)}
									/>
									<Handle
										type="source"
										position={Position.Right}
										data-state={hasTarget ? "connected" : "disconnected"}
										className={clsx(
											"!w-[12px] !absolute !h-[12px] !rounded-full !bg-black-100 !border-[2px] !top-[50%] !-translate-y-[50%] !translate-x-[5px]",
											"group-data-[type=action]:!border-[hsla(195,74%,21%,1)] group-data-[type=action]:data-[state=connected]:!bg-[hsla(187,71%,48%,1)] group-data-[type=action]:hover:!bg-[hsla(187,71%,48%,1)]",
											"group-data-[type=variable]:!border-[hsla(236,7%,39%,1)] group-data-[type=variable]:data-[state=connected]:!bg-white",
										)}
									/>
								</div>
								<div className="text-[14px] text-black--30 px-[12px]">
									Output
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
