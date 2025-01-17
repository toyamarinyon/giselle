import type {
	JobRunId,
	StepRunId,
	StepRunStatus,
	Workflow,
	WorkflowRun,
	WorkflowRunId,
} from "../giselle-data";
import { callRunStepApi } from "./call-run-step-api";
import {
	type JobWithRun,
	type StepWithRun,
	type WorkflowWithRun,
	buildWorkflowWithRun,
} from "./workflow-with-run";

interface RunWorkflowParams
	extends Pick<RunJobParams, "onJobRunStart" | "onStepRunUpdate"> {
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
	onStepRunUpdate,
}: RunWorkflowParams) {
	onWorkflowRunStart?.();
	const workflowWithRun = buildWorkflowWithRun(workflow, workflowRun);
	for (const [_, job] of workflowWithRun.jobMap) {
		await runJob({
			workflow: workflowWithRun,
			job,
			onJobRunStart,
			onStepRunUpdate,
		});
	}
}

interface RunJobParams extends Omit<RunStepParams, "step"> {
	job: JobWithRun;
	onJobRunStart?: (jobRunId: JobRunId) => void;
}
export async function runJob({
	workflow,
	job,
	onJobRunStart,
	onStepRunUpdate,
}: RunJobParams) {
	onJobRunStart?.(job.jobRunId);
	await Promise.all(
		Array.from(job.stepMap.values()).map((step) =>
			runStep({
				workflow,
				job,
				step,
				onStepRunUpdate,
			}),
		),
	);
}

interface StepRunUpdateEventBase {
	status: StepRunStatus;
	workflowRunId: WorkflowRunId;
	jobRunId: JobRunId;
	stepRunId: StepRunId;
}
interface StepRunStartEvent extends StepRunUpdateEventBase {
	status: "inProgress";
}
interface StepRunEndEvent extends StepRunUpdateEventBase {
	status: "completed";
}
type StepRunEvent =
	| StepRunUpdateEventBase
	| StepRunStartEvent
	| StepRunEndEvent;
interface RunStepParams {
	api?: string;
	workflow: WorkflowWithRun;
	step: StepWithRun;
	job: JobWithRun;
	onStepRunUpdate?: (event: StepRunEvent) => void;
}
export async function runStep({
	api = "/api/giselle/run-step",
	workflow,
	job,
	step,
	onStepRunUpdate,
}: RunStepParams) {
	onStepRunUpdate?.({
		status: "inProgress",
		workflowRunId: workflow.workflowRunId,
		jobRunId: job.jobRunId,
		stepRunId: step.stepRunId,
	});
	await callRunStepApi({
		api,
		workspaceId: workflow.workspaceId,
		workflowId: workflow.id,
		workflowRunId: workflow.workflowRunId,
		jobRunId: job.jobRunId,
		stepRunId: step.stepRunId,
	});
	onStepRunUpdate?.({
		status: "completed",
		workflowRunId: workflow.workflowRunId,
		jobRunId: job.jobRunId,
		stepRunId: step.stepRunId,
	});
}
