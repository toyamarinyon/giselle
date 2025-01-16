import {
	Background,
	BackgroundVariant,
	Panel,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
	useUpdateNodeInternals,
} from "@xyflow/react";
import { useEffect } from "react";
import bg from "../../images/bg.png";
import { useWorkflowDesigner } from "../../workflow-designer-context";
import { Header } from "./header";
import { type GiselleWorkflowDesignerNode, nodeTypes } from "./node";
import { PropertiesPanel } from "./properties-panel";

function Editor() {
	const {
		data,
		setUiNodeState,
		deleteNode,
		deleteConnection,
		updateNodeData,
		setOpenPropertiesPanel,
	} = useWorkflowDesigner();
	const reactFlowInstance = useReactFlow();
	const updateNodeInternals = useUpdateNodeInternals();
	useEffect(() => {
		reactFlowInstance.setNodes(
			Array.from(data.ui.nodeStateMap)
				.map(([nodeId, nodeState]) => {
					const nodeData = data.nodeMap.get(nodeId);
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
		updateNodeInternals(Array.from(data.ui.nodeStateMap.keys()));
	}, [data, reactFlowInstance.setNodes, updateNodeInternals]);
	useEffect(() => {
		reactFlowInstance.setEdges(
			Array.from(data.connectionMap).map(([connectionId, connection]) => ({
				id: connectionId,
				source: connection.sourceNodeId,
				target: connection.targetNodeId,
				targetHandle: connection.targetNodeHandleId,
			})),
		);
	}, [data, reactFlowInstance.setEdges]);
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
							if (nodeChange.selected) {
								setOpenPropertiesPanel(true);
							}
							break;
						}
						case "remove": {
							for (const [connectionId, connectionData] of data.connectionMap) {
								if (connectionData.sourceNodeId !== nodeChange.id) {
									continue;
								}
								deleteConnection(connectionId);
								const targetNode = data.nodeMap.get(
									connectionData.targetNodeId,
								);
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
			<Panel position="top-left" className="!top-0 !left-0 !right-0 !m-0">
				<Header />
			</Panel>
			<Panel position="top-right" className="!top-0 !bottom-0 !right-0 !m-0">
				<PropertiesPanel />
			</Panel>
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
