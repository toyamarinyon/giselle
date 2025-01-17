import { createIdGenerator } from "@/lib/utils/generate-id";
import { z } from "zod";
import { NodeData, NodeId } from "../node";
import { mapToObject, objectToMap } from "../utils";
import { WorkspaceId } from "../workspace";

export const StepId = createIdGenerator("stp");
export type StepId = z.infer<typeof StepId.schema>;
export const Step = z.object({
	id: StepId.schema,
	nodeId: NodeId.schema,
	variableNodeIds: z.preprocess((args) => {
		if (!Array.isArray(args) || args === null || args instanceof Set) {
			return args;
		}
		return new Set(args);
	}, z.set(NodeId.schema)),
});
export type Step = z.infer<typeof Step>;

export const StepJson = Step.extend({
	variableNodeIds: z.preprocess((args) => {
		if (args instanceof Set) {
			return Array.from(args);
		}
		return args;
	}, z.array(NodeId.schema)),
});

export const JobId = createIdGenerator("jb");
export type JobId = z.infer<typeof JobId.schema>;
export const Job = z.object({
	id: JobId.schema,
	stepMap: z.preprocess(objectToMap, z.map(StepId.schema, Step)),
});
export type Job = z.infer<typeof Job>;

export const JobJson = Job.extend({
	stepMap: z.preprocess(mapToObject, z.record(StepId.schema, StepJson)),
});

export const WorkflowId = createIdGenerator("wf");
export type WorkflowId = z.infer<typeof WorkflowId.schema>;
export const Workflow = z.object({
	id: WorkflowId.schema,
	workspaceId: WorkspaceId.schema,
	jobMap: z.preprocess(objectToMap, z.map(JobId.schema, Job)),
	nodeMap: z.preprocess(objectToMap, z.map(NodeId.schema, NodeData)),
});
export type Workflow = z.infer<typeof Workflow>;

export const WorkflowJson = Workflow.extend({
	jobMap: z.preprocess(mapToObject, z.record(JobId.schema, JobJson)),
	nodeMap: z.preprocess(mapToObject, z.record(NodeId.schema, NodeData)),
});
