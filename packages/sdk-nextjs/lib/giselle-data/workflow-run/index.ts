import { createIdGenerator } from "@/lib/utils/generate-id";
import { z } from "zod";
import { JobId, StepId, type Workflow, WorkflowId } from "../workflow";

export const StepRunStatus = z.enum([
	"queued",
	"inProgress",
	"completed",
	"failed",
	"cancelled",
]);
export const StepRun = z.object({
	attempts: z.number(),
	stepId: StepId.schema,
	status: StepRunStatus,
});
export type StepRun = z.infer<typeof StepRun>;

export const JobRunStatus = z.enum([
	"queued",
	"in_progress",
	"completed",
	"waiting",
	"requested",
	"pending",
]);
export const JobRun = z.object({
	attempts: z.number(),
	jobId: JobId.schema,
	status: JobRunStatus,
	stepRunSet: z.preprocess((args) => {
		if (!Array.isArray(args) || args === null || args instanceof Map) {
			return args;
		}
		return new Set(args);
	}, z.set(StepRun)),
});
export type JobRun = z.infer<typeof JobRun>;
export const JobRunJson = JobRun.extend({
	stepRunSet: z.preprocess((args) => {
		if (args instanceof Set) {
			return Array.from(args);
		}
		return args;
	}, z.array(StepRun)),
});

export const WorkflowRunStatus = z.enum([
	"completed",
	// "action_required",
	"cancelled",
	"failure",
	"neutral",
	"skipped",
	// "stale",
	"success",
	"timed_out",
	"in_progress",
	"queued",
	// "requested",
	// "waiting",
	// "pending",
]);
export const WorkflowRunId = createIdGenerator("wfr");
export type WorkflowRunId = z.infer<typeof WorkflowRunId.schema>;
export const WorkflowRun = z.object({
	id: WorkflowRunId.schema,
	workflowId: WorkflowId.schema,
	status: WorkflowRunStatus,
	jobRunSet: z.preprocess((args) => {
		if (!Array.isArray(args) || args === null || args instanceof Map) {
			return args;
		}
		return new Set(args);
	}, z.set(JobRun)),
});
export type WorkflowRun = z.infer<typeof WorkflowRun>;
export const WorkflowRunJson = WorkflowRun.extend({
	jobRunSet: z.preprocess((args) => {
		if (args instanceof Set) {
			return Array.from(args);
		}
		return args;
	}, z.array(JobRunJson)),
});
