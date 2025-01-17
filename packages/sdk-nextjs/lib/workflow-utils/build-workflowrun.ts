import {
	type JobRun,
	JobRunId,
	type StepRun,
	StepRunId,
	type Workflow,
	type WorkflowRun,
	WorkflowRunId,
} from "@/lib/giselle-data";

export function buildWorkflowRun(workflow: Workflow) {
	const workflowRunId = WorkflowRunId.generate();
	const jobRunMap = new Map<JobRunId, JobRun>();
	for (const [_, job] of workflow.jobMap) {
		const jobRunId = JobRunId.generate();
		const stepRunMap = new Map<StepRunId, StepRun>();
		for (const [_, step] of job.stepMap) {
			const node = workflow.nodeMap.get(step.nodeId);
			if (node === undefined) {
				throw new Error(`Node with id ${step.nodeId} not found`);
			}
			const stepRun = {
				id: StepRunId.generate(),
				jobRunId,
				workflowRunId,
				workflowId: workflow.id,
				workspaceId: workflow.workspaceId,
				attempts: 1,
				stepId: step.id,
				status: "waiting",
				node,
			} satisfies StepRun;
			stepRunMap.set(stepRun.id, stepRun);
		}
		const jobRun = {
			id: jobRunId,
			workflowRunId,
			attempts: 1,
			jobId: job.id,
			status: "waiting",
			stepRunMap,
			workflowId: workflow.id,
			workspaceId: workflow.workspaceId,
		} satisfies JobRun;
		jobRunMap.set(jobRun.id, jobRun);
	}
	return {
		id: workflowRunId,
		workflowId: workflow.id,
		status: "queued",
		jobRunMap,
	} satisfies WorkflowRun;
}
