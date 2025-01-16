import type { WorkspaceId } from "@/lib/giselle-data";

export function workspacePath(workspaceId: WorkspaceId) {
	return `${workspaceId}/workspace.json`;
}
