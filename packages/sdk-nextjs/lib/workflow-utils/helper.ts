import {
	type Connection,
	type ConnectionId,
	type Job,
	JobId,
	type NodeData,
	type NodeId,
	type Step,
	StepId,
	type WorkflowId,
} from "@/lib/giselle-data";

type ConnectedNodeIdMap = Map<NodeId, Set<NodeId>>;
export function createConnectedNodeIdMap(
	connectionSet: Set<Connection>,
	nodeIdSet: Set<NodeId>,
) {
	const connectionMap: ConnectedNodeIdMap = new Map();
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

export function findConnectedNodeMap(
	startNodeId: NodeId,
	nodeMap: Map<NodeId, NodeData>,
	connectionMap: ConnectedNodeIdMap,
): Map<NodeId, NodeData> {
	const connectedNodeMap = new Map<NodeId, NodeData>();
	const stack: NodeId[] = [startNodeId];

	while (stack.length > 0) {
		const currentNodeId = stack.pop() || startNodeId;
		if (connectedNodeMap.has(currentNodeId)) continue;
		const currentNode = nodeMap.get(currentNodeId);
		if (currentNode === undefined) continue;

		connectedNodeMap.set(currentNodeId, currentNode);

		const connectedNodeIdSet = connectionMap.get(currentNodeId);
		if (connectedNodeIdSet) {
			for (const connectedNodeId of connectedNodeIdSet) {
				if (!connectedNodeMap.has(connectedNodeId)) {
					stack.push(connectedNodeId);
				}
			}
		}
	}

	return connectedNodeMap;
}

export function findConnectedConnectionMap(
	connectedNodeIdSet: Set<NodeId>,
	allConnectionSet: Set<Connection>,
) {
	const connectedConnectionMap = new Map<ConnectionId, Connection>();

	for (const connection of allConnectionSet) {
		if (
			connectedNodeIdSet.has(connection.sourceNodeId) &&
			connectedNodeIdSet.has(connection.targetNodeId)
		) {
			connectedConnectionMap.set(connection.id, connection);
		}
	}

	return connectedConnectionMap;
}

/**
 * Converts a directed graph into a sequence of jobs with steps based on topological sorting.
 *
 * Input Graph:          Output Jobs:
 * A → B → D             Job1: [A]
 * ↓   ↓                 Job2: [B, C]
 * C → E                 Job3: [D, E]
 *
 * @param graph The input graph with nodes and connections
 * @returns Set of jobs where each job contains steps that can be executed in parallel
 */
export function createJobMap(
	nodeSet: Set<NodeData>,
	connectionSet: Set<Connection>,
	workflowId: WorkflowId,
) {
	/**
	 * Calculates the number of incoming edges for each node.
	 *
	 * Example:
	 * A → B → C
	 * ↓   ↓
	 * D → E
	 *
	 * Results:
	 * A: 0
	 * B: 1
	 * C: 1
	 * D: 1
	 * E: 2
	 */
	const calculateInDegrees = (
		nodeIdSet: Set<NodeId>,
		connectionSet: Set<Connection>,
	): Map<string, number> => {
		const inDegrees = new Map<NodeId, number>();

		for (const nodeId of nodeIdSet) {
			inDegrees.set(nodeId, 0);
		}

		for (const conn of connectionSet) {
			const currentDegree = inDegrees.get(conn.targetNodeId) || 0;
			inDegrees.set(conn.targetNodeId, currentDegree + 1);
		}

		return inDegrees;
	};

	/**
	 * Gets all direct child nodes of a given node.
	 *
	 * Example:
	 * For node A in:
	 * A → B
	 * ↓
	 * C
	 *
	 * Returns: [B, C]
	 */
	const getChildNodes = (
		nodeId: NodeId,
		connectionSet: Set<Connection>,
	): Set<NodeId> => {
		const childNodeIdSet = new Set<NodeId>();
		for (const connection of connectionSet) {
			if (connection.sourceNodeId !== nodeId) {
				continue;
			}
			childNodeIdSet.add(connection.targetNodeId);
		}
		return childNodeIdSet;
	};

	/**
	 * Performs topological sort and groups nodes by levels.
	 *
	 * Example graph:       Result levels:
	 * A → B → D            Level 1: [A]
	 * ↓   ↓                Level 2: [B, C]
	 * C → E                Level 3: [D, E]
	 *
	 * Each level contains nodes that can be processed in parallel
	 */
	const topologicalSort = (
		nodeIdSet: Set<NodeId>,
		connectionSet: Set<Connection>,
	): Set<Set<NodeId>> => {
		const inDegrees = calculateInDegrees(nodeIdSet, connectionSet);
		const levels = new Set<Set<NodeId>>();
		let currentLevel = new Set<NodeId>();

		for (const nodeId of nodeIdSet) {
			if (inDegrees.get(nodeId) === 0) {
				currentLevel.add(nodeId);
			}
		}

		while (currentLevel.size > 0) {
			levels.add(new Set(currentLevel));
			const nextLevel = new Set<NodeId>();

			for (const nodeId of currentLevel) {
				const childrenNodeIdSet = getChildNodes(nodeId, connectionSet);
				for (const childNodeId of childrenNodeIdSet) {
					const newDegree = (inDegrees.get(childNodeId) || 0) - 1;
					inDegrees.set(childNodeId, newDegree);
					if (newDegree === 0) {
						nextLevel.add(childNodeId);
					}
				}
			}

			currentLevel = nextLevel;
		}

		return levels;
	};

	function connectedVariableNodeIds(nodeId: NodeId) {
		const variableNodeIdSet = new Set<NodeId>();
		for (const connection of connectionSet) {
			if (
				connection.targetNodeId !== nodeId ||
				connection.sourceNodeType !== "variable"
			) {
				continue;
			}
			variableNodeIdSet.add(connection.sourceNodeId);
		}
		return variableNodeIdSet;
	}

	const actionNodeIdSet = new Set<NodeId>();
	for (const node of nodeSet) {
		if (node.type === "action") {
			actionNodeIdSet.add(node.id);
		}
	}
	const actionConnectionSet = new Set<Connection>();
	for (const connection of connectionSet) {
		if (connection.sourceNodeType === "action") {
			actionConnectionSet.add(connection);
		}
	}
	const levels = topologicalSort(actionNodeIdSet, actionConnectionSet);

	const jobMap = new Map<JobId, Job>();
	for (const level of levels) {
		const jobId = JobId.generate();
		const stepMap = new Map<StepId, Step>();
		for (const subLevel of level) {
			const step = {
				id: StepId.generate(),
				nodeId: subLevel,
				jobId,
				variableNodeIds: connectedVariableNodeIds(subLevel),
				workflowId,
			} satisfies Step;
			stepMap.set(step.id, step);
		}
		const job = {
			id: jobId,
			stepMap: stepMap,
			workflowId,
		} satisfies Job;
		jobMap.set(job.id, job);
	}
	return jobMap;
}
