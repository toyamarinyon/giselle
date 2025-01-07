import type { CreateNodeParams, Node, NodeId } from "./types";
function createNodeId() {
	return `nd_${Math.random().toString(36)}` satisfies NodeId;
}
export function createNode(params: CreateNodeParams): Node {
	return {
		id: createNodeId(),
		...params,
	};
}
