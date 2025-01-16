import type { Workspace, WorkspaceId, WorkspaceJson } from "@/lib/giselle-data";
import type { Storage } from "unstorage";
import { workspacePath } from "./workspace-path";

export async function setGraphToStorage({
	storage,
	workspaceId,
	workspace,
}: {
	storage: Storage<WorkspaceJson>;
	workspaceId: WorkspaceId;
	workspace: WorkspaceJson;
}) {
	await storage.setItem(workspacePath(workspaceId), workspace, {
		// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
		cacheControlMaxAge: 0,
	});
}
