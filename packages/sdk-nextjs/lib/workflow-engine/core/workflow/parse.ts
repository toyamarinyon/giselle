import type { WorkflowData } from "@/lib/workflow-data";
import type {
	Connection,
	ConnectionId,
	NodeId,
} from "@/lib/workflow-data/node/types";

type ConnectionMap = Map<NodeId, Set<NodeId>>;
export function createConnectionMap(
	connectionSet: Set<Connection>,
	nodeIdSet: Set<NodeId>,
) {
	const connectionMap: ConnectionMap = new Map();
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

export function findConnectedNodes(
	startNodeId: NodeId,
	connectionMap: ConnectionMap,
): Set<NodeId> {
	const connectedNodes = new Set<NodeId>();
	const stack: NodeId[] = [startNodeId];

	while (stack.length > 0) {
		const currentNodeId = stack.pop() || startNodeId;
		if (connectedNodes.has(currentNodeId)) continue;

		connectedNodes.add(currentNodeId);

		const connectedNodeIds = connectionMap.get(currentNodeId);
		if (connectedNodeIds) {
			for (const connectedNodeId of connectedNodeIds) {
				if (!connectedNodes.has(connectedNodeId)) {
					stack.push(connectedNodeId);
				}
			}
		}
	}

	return connectedNodes;
}

export function findConnectedConnections(
	connectedNodeIdSet: Set<NodeId>,
	allConnectionSet: Set<Connection>,
): Set<ConnectionId> {
	const connectedConnectionSet = new Set<ConnectionId>();

	for (const connection of allConnectionSet) {
		if (
			connectedNodeIdSet.has(connection.sourceNodeId) &&
			connectedNodeIdSet.has(connection.targetNodeId)
		) {
			connectedConnectionSet.add(connection.id);
		}
	}

	return connectedConnectionSet;
}
