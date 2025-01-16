import {
	type Connection,
	type ConnectionId,
	type NodeData,
	type NodeId,
	type Workflow,
	WorkflowId,
} from "@/lib/giselle-data";
import {
	createConnectedNodeIdMap,
	createJobSet,
	findConnectedConnectionMap,
	findConnectedNodeMap,
} from "./helper";

export function buildWorkflowMap(
	nodeMap: Map<NodeId, NodeData>,
	connectionMap: Map<ConnectionId, Connection>,
) {
	const workflowSet = new Set<Workflow>();
	let processedNodeSet = new Set<NodeId>();

	const connectedNodeIdMap = createConnectedNodeIdMap(
		new Set(connectionMap.values()),
		new Set(nodeMap.keys()),
	);
	for (const [nodeId, node] of nodeMap) {
		if (node.type !== "action") continue;
		if (processedNodeSet.has(nodeId)) continue;
		const connectedNodeMap = findConnectedNodeMap(
			nodeId,
			nodeMap,
			connectedNodeIdMap,
		);
		const connectedConnectionMap = findConnectedConnectionMap(
			new Set(connectedNodeMap.keys()),
			new Set(connectionMap.values()),
		);
		const jobSet = createJobSet(
			new Set(connectedNodeMap.values()),
			new Set(connectedConnectionMap.values()),
		);
		workflowSet.add({
			id: WorkflowId.generate(),
			jobSet,
			nodeSet: new Set(connectedNodeMap.values()),
		});

		processedNodeSet = processedNodeSet.union(new Set(connectedNodeMap.keys()));
	}
	return workflowSet;
}
