import {
	Workspace,
	type WorkspaceId,
	type WorkspaceJson,
} from "@/lib/giselle-data";
import type { Storage } from "unstorage";
import { workspacePath } from "./workspace-path";

export async function getWorkspace({
	storage,
	workspaceId,
}: {
	storage: Storage<WorkspaceJson>;
	workspaceId: WorkspaceId;
}) {
	const result = await storage.getItem(workspacePath(workspaceId));
	return Workspace.parse(result);
}
