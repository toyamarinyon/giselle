import {
	Background,
	BackgroundVariant,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { useEffect } from "react";
import { useWorkflowDesigner } from "../../workflow-designer-context";
import bg from "./bg.png";
import { nodeTypes } from "./node";

function Editor() {
	const { data } = useWorkflowDesigner();
	const reactFlowInstance = useReactFlow();
	useEffect(() => {
		reactFlowInstance.setNodes(
			Array.from(data.ui.nodeState)
				.map(([nodeId, nodeState]) => {
					const nodeData = data.nodes.get(nodeId);
					if (nodeData === undefined) {
						return null;
					}
					return {
						id: nodeId,
						type: nodeData.content.type,
						position: { x: nodeState.position.x, y: nodeState.position.y },
						selected: nodeState.selected,
						data: { nodeData: nodeData },
					};
				})
				.filter((result) => result !== null),
		);
	}, [data, reactFlowInstance.setNodes]);
	return (
		<ReactFlow
			className="giselle-workflow-editor"
			colorMode="dark"
			defaultNodes={[]}
			defaultEdges={[]}
			nodeTypes={nodeTypes}
		>
			<Background
				className="!bg-black-100"
				lineWidth={0}
				variant={BackgroundVariant.Lines}
				style={{
					backgroundImage: `url(${bg.src})`,
					backgroundPositionX: "center",
					backgroundPositionY: "center",
					backgroundSize: "cover",
				}}
			/>
		</ReactFlow>
	);
}

export default function () {
	return (
		<ReactFlowProvider>
			<Editor />
		</ReactFlowProvider>
	);
}
