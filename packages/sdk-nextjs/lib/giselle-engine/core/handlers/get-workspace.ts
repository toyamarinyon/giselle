import { WorkspaceId, WorkspaceJson } from "@/lib/giselle-data";
import { z } from "zod";
import { getWorkspace as getWorkspaceInternal } from "../helpers/get-workspace";
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
	const workspace = await getWorkspaceInternal({
		storage: context.storage,
		workspaceId: input.workspaceId,
	});
	return Output.parse({ workspace });
}
