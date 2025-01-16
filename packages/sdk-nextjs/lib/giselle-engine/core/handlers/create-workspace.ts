import { createIdGenerator } from "@/lib/utils/generate-id";
import {
	WorkspaceId,
	WorkspaceJson,
	generateInitialWorkspace,
} from "@/lib/workflow-data";
import { z } from "zod";
import { setGraphToStorage } from "../helpers/set-graph-to-storage";
import type { WorkspaceEngineHandlerArgs } from "./types";

export const Output = z.object({
	Workspace: WorkspaceJson,
});

export async function createWorkspace({ context }: WorkspaceEngineHandlerArgs) {
	const Workspace = generateInitialWorkspace();
	await setGraphToStorage({
		storage: context.storage,
		workflowId: Workspace.id,
		Workspace: WorkspaceJson.parse(Workspace),
	});
	return Output.parse({ Workspace });
}
