import type { Execution, Flow, Graph, Job, JobExecution } from "../types";
import { createExecutionId, createJobExecutionId } from "./utils";

function createJobExecutionFromJob(job: Job): JobExecution {
	return {
		id: createJobExecutionId(),
		status: "pending",
		stepExecutions: job.steps.map((step) => ({
			id: `stex_${step.id}`,
			nodeId: step.nodeId,
			status: "pending",
		})),
	};
}

export function createExecutionFromFlow(flow: Flow, graph: Graph): Execution {
	return {
		id: createExecutionId(),
		status: "pending",
		flowId: flow.id,
		jobExecutions: flow.jobs.map(createJobExecutionFromJob),
	};
}
