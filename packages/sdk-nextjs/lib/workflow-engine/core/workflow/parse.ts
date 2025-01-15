import type { WorkflowData } from "@/lib/workflow-data";
import type { Connection, NodeId } from "@/lib/workflow-data/node/types";

export function createConnectionMap(
	connectionSet: Set<Connection>,
	nodeIdSet: Set<NodeId>,
) {
	const connectionMap = new Map<NodeId, Set<NodeId>>();
	for (const connection of connectionSet) {
		if (
			!nodeIdSet.has(connection.sourceNodeId) ||
			!nodeIdSet.has(connection.targetNodeId)
		) {
			continue;
		}
		if (!connectionMap.has(connection.sourceNodeId)) {
			connectionMap.set(connection.sourceNodeId, new Set());
		}
		const sourceSet = connectionMap.get(connection.sourceNodeId);
		if (sourceSet) {
			sourceSet.add(connection.targetNodeId);
		}

		if (!connectionMap.has(connection.targetNodeId)) {
			connectionMap.set(connection.targetNodeId, new Set());
		}
		const targetSet = connectionMap.get(connection.targetNodeId);
		if (targetSet) {
			targetSet.add(connection.sourceNodeId);
		}
	}
	return connectionMap;
}
export function parse(workflowData: WorkflowData) {
	const processedNodes = new Set<NodeId>();
	const connectionMap = new Map<NodeId, Set<NodeId>>();
	const nodeIds = new Set<NodeId>(workflowData.nodes.keys());
	for (const [connectionId, connection] of workflowData.connections) {
		if (
			!nodeIds.has(connection.sourceNodeId) ||
			!nodeIds.has(connection.targetNodeId)
		) {
			continue;
		}
		if (!connectionMap.has(connection.sourceNodeId)) {
			connectionMap.set(connection.sourceNodeId, new Set());
		}
		const sourceSet = connectionMap.get(connection.sourceNodeId);
		if (sourceSet) {
			sourceSet.add(connection.targetNodeId);
		}

		if (!connectionMap.has(connection.targetNodeId)) {
			connectionMap.set(connection.targetNodeId, new Set());
		}
		const targetSet = connectionMap.get(connection.targetNodeId);
		if (targetSet) {
			targetSet.add(connection.sourceNodeId);
		}
	}
}
