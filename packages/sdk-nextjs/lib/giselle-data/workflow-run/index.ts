import { createIdGenerator } from "@/lib/utils/generate-id";
import { z } from "zod";
import { NodeData } from "../node";
import { mapToObject, objectToMap } from "../utils";
import { JobId, StepId, WorkflowId } from "../workflow";

export const StepRunStatus = z.enum([
	"queued",
	"inProgress",
	"completed",
	"failed",
	"cancelled",
	"waiting",
]);
export type StepRunStatus = z.infer<typeof StepRunStatus>;
export const StepRunId = createIdGenerator("str");
export type StepRunId = z.infer<typeof StepRunId.schema>;
export const JobRunId = createIdGenerator("jbr");
export type JobRunId = z.infer<typeof JobRunId.schema>;
export const WorkflowRunId = createIdGenerator("wfr");
export type WorkflowRunId = z.infer<typeof WorkflowRunId.schema>;

export const StepRun = z.object({
	id: StepRunId.schema,
	attempts: z.number(),
	stepId: StepId.schema,
	status: StepRunStatus,
	jobRunId: JobRunId.schema,
	workflowRunId: WorkflowRunId.schema,
	node: NodeData,
	result: z.any(),
});
export type StepRun = z.infer<typeof StepRun>;

export const JobRunStatus = z.enum([
	"queued",
	"inProgress",
	"completed",
	"waiting",
	"requested",
	"pending",
]);
export const JobRun = z.object({
	id: JobRunId.schema,
	attempts: z.number(),
	jobId: JobId.schema,
	workflowRunId: WorkflowRunId.schema,
	status: JobRunStatus,
	stepRunMap: z.preprocess(objectToMap, z.map(StepRunId.schema, StepRun)),
});
export type JobRun = z.infer<typeof JobRun>;
export const JobRunJson = JobRun.extend({
	stepRunMap: z.preprocess(mapToObject, z.record(StepRunId.schema, StepRun)),
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
	"inProgress",
	"queued",
	// "requested",
	"waiting",
	// "pending",
]);
export const WorkflowRun = z.object({
	id: WorkflowRunId.schema,
	workflowId: WorkflowId.schema,
	status: WorkflowRunStatus,
	jobRunMap: z.preprocess(objectToMap, z.map(JobRunId.schema, JobRun)),
});
export type WorkflowRun = z.infer<typeof WorkflowRun>;
export const WorkflowRunJson = WorkflowRun.extend({
	jobRunMap: z.preprocess(mapToObject, z.record(JobRunId.schema, JobRunJson)),
});
