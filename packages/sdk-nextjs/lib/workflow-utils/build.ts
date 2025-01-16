import {
	type Connection,
	type ConnectionId,
	type JobRun,
	type NodeData,
	type NodeId,
	type StepRun,
	type Workflow,
	WorkflowId,
	WorkflowRun,
	WorkflowRunId,
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
			jobMap: jobSet,
			nodeMap: new Set(connectedNodeMap.values()),
		});

		processedNodeSet = processedNodeSet.union(new Set(connectedNodeMap.keys()));
	}
	const workflowMap = new Map<WorkflowId, Workflow>();
	for (const workflow of workflowSet) {
		workflowMap.set(workflow.id, workflow);
	}
	return workflowMap;
}

export function buildWorkflowRun(workflow: Workflow) {
	const jobRunSet = new Set<JobRun>();
	for (const job of workflow.jobMap) {
		const stepRunSet = new Set<StepRun>();
		for (const step of job.stepMap) {
			stepRunSet.add({
				attempts: 1,
				stepId: step.id,
				status: "queued",
			});
		}
		jobRunSet.add({
			attempts: 1,
			jobId: job.id,
			status: "queued",
			stepRunSet,
		});
	}
	return WorkflowRun.parse({
		id: WorkflowRunId.generate(),
		workflowId: workflow.id,
		status: "queued",
		jobRunSet,
	});
}
