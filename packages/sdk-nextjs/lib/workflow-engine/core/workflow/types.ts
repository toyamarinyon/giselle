import { createIdGenerator } from "@/lib/utils/generate-id";
import { nodeId } from "@/lib/workflow-data/node/types";
import { z } from "zod";

export const StepId = createIdGenerator("stp");
export type StepId = z.infer<typeof StepId.schema>;
export const Step = z.object({
	id: StepId.schema,
	nodeId: nodeId.schema,
	variableNodeIds: z.set(nodeId.schema),
});
export type Step = z.infer<typeof Step>;

export const JobId = createIdGenerator("jb");
export type JobId = z.infer<typeof JobId.schema>;
export const Job = z.object({
	id: JobId.schema,
	stepSet: z.set(Step),
});
export type Job = z.infer<typeof Job>;
