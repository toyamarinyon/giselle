import type { Workspace, WorkspaceId, WorkspaceJson } from "@/lib/giselle-data";
import type { Storage } from "unstorage";
import { WorkspacePath } from "./workspace-path";

export async function setGraphToStorage({
	storage,
	workflowId,
	Workspace,
}: {
	storage: Storage<WorkspaceJson>;
	workflowId: WorkspaceId;
	Workspace: WorkspaceJson;
}) {
	await storage.setItem(WorkspacePath(workflowId), Workspace, {
		// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
		cacheControlMaxAge: 0,
	});
}
