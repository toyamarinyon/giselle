import {
	type BaseNodeData,
	type Connection,
	type ConnectionHandle,
	connectionHandleId,
	ConnectionId,
} from "./types";

export function createConnection({
	sourceNode,
	targetNodeHandle,
}: {
	sourceNode: BaseNodeData;
	targetNodeHandle: ConnectionHandle;
}): Connection {
	return {
		id: ConnectionId.generate(),
		sourceNodeId: sourceNode.id,
		sourceNodeType: sourceNode.type,
		targetNodeId: targetNodeHandle.nodeId,
		targetNodeType: targetNodeHandle.nodeType,
		targetNodeHandleId: targetNodeHandle.id,
	};
}

export function createConnectionHandle({
	nodeId,
	nodeType,
	label,
}: Omit<ConnectionHandle, "id">): ConnectionHandle {
	return {
		id: connectionHandleId.generate(),
		nodeId,
		nodeType,
		label,
	};
}
