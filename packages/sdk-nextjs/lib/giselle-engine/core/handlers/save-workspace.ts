import { WorkspaceId, WorkspaceJson } from "@/lib/workflow-data";
import type { StorageMeta } from "unstorage";
import { z } from "zod";
import { setGraphToStorage } from "../helpers/set-graph-to-storage";
import type { WorkspaceEngineHandlerArgs } from "./types";

export const Input = z.object({
	workflowId: WorkspaceId.schema,
	Workspace: WorkspaceJson,
});
export const Output = z.object({
	Workspace: WorkspaceJson,
	meta: z.custom<StorageMeta>(),
});
export async function saveWorkspace({
	context,
	unsafeInput,
}: WorkspaceEngineHandlerArgs<z.infer<typeof Input>>) {
	const input = Input.parse(unsafeInput);
	setGraphToStorage({
		storage: context.storage,
		workflowId: input.workflowId,
		Workspace: input.Workspace,
	});
	const meta = await context.storage.getMeta(`${input.workflowId}.json`);
	return Output.parse({
		Workspace: input.Workspace,
		meta,
	});
}
