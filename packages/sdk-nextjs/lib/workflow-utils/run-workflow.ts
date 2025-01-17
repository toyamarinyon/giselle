import type {
	JobRunId,
	StepRunId,
	Workflow,
	WorkflowRun,
} from "../giselle-data";
import {
	type JobWithRun,
	type StepWithRun,
	buildWorkflowWithRun,
} from "./workflow-with-run";

interface RunWorkflowParams extends Omit<RunJobParams, "job"> {
	workflow: Workflow;
	workflowRun: WorkflowRun;
	onWorkflowRunStart?: () => void;
}
export type RunWorkflowEventHandlers = Omit<
	RunWorkflowParams,
	"workflow" | "workflowRun"
>;
export async function runWorkflow({
	workflow,
	workflowRun,
	onWorkflowRunStart,
	onJobRunStart,
	onStepRunStart,
}: RunWorkflowParams) {
	onWorkflowRunStart?.();
	const workflowWithRun = buildWorkflowWithRun(workflow, workflowRun);
	for (const [_, job] of workflowWithRun.jobMap) {
		await runJob({
			job,
			onJobRunStart,
			onStepRunStart,
		});
	}
}

interface RunJobParams extends Omit<RunStepParams, "step"> {
	job: JobWithRun;
	onJobRunStart?: (jobRunId: JobRunId) => void;
	onStepRunStart?: (stepRunId: StepRunId) => void;
}
export async function runJob({
	job,
	onJobRunStart,
	onStepRunStart,
}: RunJobParams) {
	onJobRunStart?.(job.jobRunId);
	await Promise.all(
		Array.from(job.stepMap.values()).map((step) =>
			runStep({
				step,
				onStepRunStart,
			}),
		),
	);
}

interface RunStepParams {
	step: StepWithRun;
	onStepRunStart?: (stepRunId: StepRunId) => void;
}
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export async function runStep({ step, onStepRunStart }: RunStepParams) {
	onStepRunStart?.(step.stepRunId);
	console.log("sleep");
	await sleep(2000);
	console.log("awake");
}
