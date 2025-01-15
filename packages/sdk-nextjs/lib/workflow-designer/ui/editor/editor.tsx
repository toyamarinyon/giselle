import { nodeId } from "@/lib/workflow-data/node/types";
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
import { type GiselleWorkflowDesignerNode, nodeTypes } from "./node";

function Editor() {
	const { data, setUiNodeState, deleteNode, deleteConnection, updateNodeData } =
		useWorkflowDesigner();
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
		<ReactFlow<GiselleWorkflowDesignerNode>
			className="giselle-workflow-editor"
			colorMode="dark"
			defaultNodes={[]}
			defaultEdges={[]}
			nodeTypes={nodeTypes}
			onNodesChange={(nodesChange) => {
				nodesChange.map((nodeChange) => {
					switch (nodeChange.type) {
						case "select": {
							setUiNodeState(nodeChange.id, { selected: nodeChange.selected });
							break;
						}
						case "remove": {
							for (const [connectionId, connectionData] of data.connections) {
								if (connectionData.sourceNodeId !== nodeChange.id) {
									continue;
								}
								deleteConnection(connectionId);
								const targetNode = data.nodes.get(connectionData.targetNodeId);
								if (targetNode === undefined) {
									continue;
								}
								switch (targetNode.content.type) {
									case "textGeneration": {
										updateNodeData(targetNode, {
											content: {
												...targetNode.content,
												sources: targetNode.content.sources.filter(
													(source) =>
														source.id !== connectionData.targetNodeHandleId,
												),
												requirement:
													targetNode.content.requirement?.id ===
													connectionData.targetNodeHandleId
														? undefined
														: targetNode.content.requirement,
											},
										});
									}
								}
							}
							deleteNode(nodeChange.id);
							break;
						}
					}
				});
			}}
			onNodeDragStop={(_event, _node, nodes) => {
				nodes.map((node) => {
					setUiNodeState(node.id, { position: node.position });
				});
			}}
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
