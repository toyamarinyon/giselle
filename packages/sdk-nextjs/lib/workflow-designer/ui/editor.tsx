import {
	Background,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { useEffect } from "react";
import { useWorkflowDesigner } from "../workflow-designer-context";

function Editor() {
	const { data } = useWorkflowDesigner();
	const reactFlowInstance = useReactFlow();
	useEffect(() => {
		reactFlowInstance.setNodes(
			Array.from(data.nodes).map(([nodeId, node]) => ({
				id: nodeId,
				position: { x: 0, y: 0 },
				data: {},
			})),
		);
	}, [data, reactFlowInstance.setNodes]);
	return (
		<ReactFlow colorMode="dark" defaultNodes={[]} defaultEdges={[]}>
			<Background />
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
