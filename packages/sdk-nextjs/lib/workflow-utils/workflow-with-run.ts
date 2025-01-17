import type {
	Job,
	JobId,
	JobRun,
	JobRunId,
	NodeData,
	Step,
	StepId,
	StepRun,
	StepRunId,
	Workflow,
	WorkflowRun,
	WorkflowRunId,
} from "../giselle-data";

export type StepWithRun = Step &
	Pick<StepRun, "status" | "attempts"> & {
		stepRunId: StepRunId;
		node: NodeData;
	};
export type JobWithRun = Omit<Job, "stepMap"> &
	Pick<JobRun, "status" | "attempts"> & {
		stepMap: Map<StepId, StepWithRun>;
	} & {
		jobRunId: JobRunId;
	};
export type WorkflowWithRun = Pick<Workflow, "id"> &
	Pick<WorkflowRun, "status"> & {
		jobMap: Map<JobId, JobWithRun>;
		workflowRunId: WorkflowRunId;
	};

export function buildWorkflowWithRun(
	workflow: Workflow,
	workflowRun: WorkflowRun,
) {
	const jobWithRunMap = new Map<JobId, JobWithRun>();
	for (const [jobRunId, jobRun] of workflowRun.jobRunMap) {
		const job = workflow.jobMap.get(jobRun.jobId);
		if (job === undefined) {
			console.warn(`Job not found: ${jobRun.jobId}`);
			continue;
		}
		const stepWithRunMap = new Map<StepId, StepWithRun>();
		for (const [stepRunId, stepRun] of jobRun.stepRunMap) {
			const step = job.stepMap.get(stepRun.stepId);
			if (step === undefined) {
				console.warn(`Step not found: ${stepRun.stepId}`);
				continue;
			}
			const node = workflow.nodeMap.get(step.nodeId);
			if (node === undefined) {
				console.warn(`Node not found: ${step.nodeId}`);
				continue;
			}
			stepWithRunMap.set(step.id, {
				...step,
				node,
				stepRunId,
				status: stepRun.status,
				attempts: stepRun.attempts,
			});
		}
		jobWithRunMap.set(job.id, {
			...job,
			jobRunId,
			status: jobRun.status,
			attempts: jobRun.attempts,
			stepMap: stepWithRunMap,
		});
	}
	const workflowWithRun = {
		id: workflow.id,
		status: workflowRun.status,
		jobMap: jobWithRunMap,
		workflowRunId: workflowRun.id,
	} satisfies WorkflowWithRun;
	return workflowWithRun;
}
