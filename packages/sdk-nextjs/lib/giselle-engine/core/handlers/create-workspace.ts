import {
	WorkspaceId,
	WorkspaceJson,
	generateInitialWorkspace,
} from "@/lib/giselle-data";
import { createIdGenerator } from "@/lib/utils/generate-id";
import { z } from "zod";
import { setWorkspace } from "../helpers/set-workspace";
import type { WorkspaceEngineHandlerArgs } from "./types";

export const Output = z.object({
	workspace: WorkspaceJson,
});

export async function createWorkspace({ context }: WorkspaceEngineHandlerArgs) {
	const workspace = generateInitialWorkspace();
	await setWorkspace({
		storage: context.storage,
		workspaceId: workspace.id,
		workspace: WorkspaceJson.parse(workspace),
	});
	return Output.parse({ workspace });
}
