import { WorkspaceId, WorkspaceJson } from "@/lib/workflow-data";
import { z } from "zod";
import { WorkspacePath } from "../helpers/workspace-path";
import type { WorkspaceEngineHandlerArgs } from "./types";

const Input = z.object({
	workflowId: WorkspaceId.schema,
});
export const Output = z.object({
	Workspace: WorkspaceJson,
});

export async function getWorkspace({
	context,
	unsafeInput,
}: WorkspaceEngineHandlerArgs<z.infer<typeof Input>>) {
	const input = Input.parse(unsafeInput);
	const result = await context.storage.getItem(WorkspacePath(input.workflowId));
	if (result === null) {
		throw new Error("Workflow not found");
	}
	return Output.parse({ Workspace: result });
}
