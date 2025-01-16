import { createIdGenerator } from "@/lib/utils/generate-id";
import { z } from "zod";
import { NodeData, NodeId } from "../node";

export const StepId = createIdGenerator("stp");
export type StepId = z.infer<typeof StepId.schema>;
export const Step = z.object({
	id: StepId.schema,
	nodeId: NodeId.schema,
	variableNodeIds: z.set(NodeId.schema),
});
export type Step = z.infer<typeof Step>;

export const JobId = createIdGenerator("jb");
export type JobId = z.infer<typeof JobId.schema>;
export const Job = z.object({
	id: JobId.schema,
	stepSet: z.set(Step),
});
export type Job = z.infer<typeof Job>;

export const WorkflowId = createIdGenerator("wf");
export const Workflow = z.object({
	id: WorkflowId.schema,
	jobSet: z.set(Job),
	nodeSet: z.set(NodeData),
});
