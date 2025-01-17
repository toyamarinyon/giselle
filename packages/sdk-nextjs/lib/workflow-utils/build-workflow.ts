import {
	type Connection,
	type ConnectionId,
	type NodeData,
	type NodeId,
	type Workflow,
	WorkflowId,
	type WorkspaceId,
} from "@/lib/giselle-data";
import {
	createConnectedNodeIdMap,
	createJobMap,
	findConnectedConnectionMap,
	findConnectedNodeMap,
} from "./helper";

export function buildWorkflowMap(
	nodeMap: Map<NodeId, NodeData>,
	connectionMap: Map<ConnectionId, Connection>,
	workspaceId: WorkspaceId,
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
		const jobSet = createJobMap(
			new Set(connectedNodeMap.values()),
			new Set(connectedConnectionMap.values()),
		);
		workflowSet.add({
			workspaceId,
			id: WorkflowId.generate(),
			jobMap: jobSet,
			nodeMap: connectedNodeMap,
		});

		processedNodeSet = processedNodeSet.union(new Set(connectedNodeMap.keys()));
	}
	const workflowMap = new Map<WorkflowId, Workflow>();
	for (const workflow of workflowSet) {
		workflowMap.set(workflow.id, workflow);
	}
	return workflowMap;
}
