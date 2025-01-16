import { WorkspaceId, WorkspaceJson } from "@/lib/giselle-data";
import type { StorageMeta } from "unstorage";
import { z } from "zod";
import { setGraphToStorage } from "../helpers/set-graph-to-storage";
import { workspacePath } from "../helpers/workspace-path";
import type { WorkspaceEngineHandlerArgs } from "./types";

export const Input = z.object({
	workspaceId: WorkspaceId.schema,
	workspace: WorkspaceJson,
});
export const Output = z.object({
	workspace: WorkspaceJson,
	meta: z.custom<StorageMeta>(),
});
export async function saveWorkspace({
	context,
	unsafeInput,
}: WorkspaceEngineHandlerArgs<z.infer<typeof Input>>) {
	const input = Input.parse(unsafeInput);
	setGraphToStorage({
		storage: context.storage,
		workspaceId: input.workspaceId,
		workspace: input.workspace,
	});
	const meta = await context.storage.getMeta(workspacePath(input.workspaceId));
	return Output.parse({
		workspace: input.workspace,
		meta,
	});
}
