import {
	JobRunId,
	StepRunId,
	WorkflowId,
	WorkflowRunId,
	WorkspaceId,
} from "@/lib/giselle-data";
import { z } from "zod";
import type { WorkspaceEngineHandlerArgs } from "./types";

export const Input = z.object({
	workspaceId: WorkspaceId.schema,
	workflowId: WorkflowId.schema,
	workflowRunId: WorkflowRunId.schema,
	jobRunId: JobRunId.schema,
	stepRunId: StepRunId.schema,
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export async function runStep({
	unsafeInput,
}: WorkspaceEngineHandlerArgs<z.infer<typeof Input>>) {
	await sleep(1000 * Math.random());
	const input = Input.parse(unsafeInput);
	return { message: "hello" };
}
