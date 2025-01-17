import { WorkspaceId, WorkspaceJson } from "@/lib/giselle-data";
import { z } from "zod";
import { workspacePath } from "../helpers/workspace-path";
import type { WorkspaceEngineHandlerArgs } from "./types";

const Input = z.object({
	workspaceId: WorkspaceId.schema,
});
export const Output = z.object({
	workspace: WorkspaceJson,
});

export async function getWorkspace({
	context,
	unsafeInput,
}: WorkspaceEngineHandlerArgs<z.infer<typeof Input>>) {
	const input = Input.parse(unsafeInput);
	const result = await context.storage.getItem(
		workspacePath(input.workspaceId),
	);
	if (result === null) {
		throw new Error("Workflow not found");
	}
	return Output.parse({ workspace: result });
}
