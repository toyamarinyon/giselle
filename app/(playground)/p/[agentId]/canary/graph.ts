import type { ConnectionId, Files, Graph, NodeId, SubGraph } from "./types";
import { createSubgraphId } from "./utils";

export function deriveSubGraphs(graph: Graph): SubGraph[] {
	const processedNodes = new Set<NodeId>();
	const subGraphs: SubGraph[] = [];
	const connectionMap = new Map<NodeId, Set<NodeId>>();

	for (const connection of graph.connections) {
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

	function findConnectedComponent(startNodeId: NodeId): Set<NodeId> {
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
	function findSubGraphConnections(nodes: Set<NodeId>): Set<ConnectionId> {
		const subGraphConnections = new Set<ConnectionId>();

		for (const connection of graph.connections) {
			if (
				nodes.has(connection.sourceNodeId) &&
				nodes.has(connection.targetNodeId)
			) {
				subGraphConnections.add(connection.id);
			}
		}

		return subGraphConnections;
	}

	for (const node of graph.nodes) {
		if (processedNodes.has(node.id)) continue;

		const connectedNodes = findConnectedComponent(node.id);

		if (connectedNodes.size > 0) {
			const subGraphConnections = findSubGraphConnections(connectedNodes);

			const subGraph: SubGraph = {
				id: createSubgraphId(),
				name: `SubGraph ${subGraphs.length + 1}`,
				nodes: Array.from(connectedNodes),
				connections: Array.from(subGraphConnections),
			};

			subGraphs.push(subGraph);

			for (const nodeId of connectedNodes) {
				processedNodes.add(nodeId);
			}
		} else {
			const subGraph: SubGraph = {
				id: createSubgraphId(),
				name: `SubGraph ${subGraphs.length + 1}`,
				nodes: [node.id],
				connections: [],
			};

			subGraphs.push(subGraph);
			processedNodes.add(node.id);
		}
	}

	return subGraphs;
}

export function isLatestVersion(graph: Graph): boolean {
	return graph.version === "2024-12-10";
}

export function migrateGraph(graph: Graph): Graph {
	let newGraph = graph;
	// @ts-ignore: Old graph has no version field
	if (typeof graph.version === "undefined") {
		newGraph = {
			...newGraph,
			version: "2024-12-09",
			subGraphs: deriveSubGraphs(newGraph),
		};
	}

	if (newGraph.version === "2024-12-09") {
		newGraph = {
			...newGraph,
			version: "2024-12-10",
			nodes: newGraph.nodes
				.map((node) => {
					if (node.content.type !== "file") {
						return node;
					}
					if (node.content.data == null) {
						return null;
					}
					return {
						...node,
						type: "variable",
						content: {
							type: "files",
							data: [node.content.data],
						},
					} satisfies Files;
				})
				.filter((node) => node !== null),
		};
	}

	if (newGraph.version === "2024-12-10") {
		newGraph = {
			...newGraph,
			version: "2024-12-11",
			subGraphs: deriveSubGraphs(newGraph),
		};
	}

	return newGraph;
}
