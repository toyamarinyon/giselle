import type { WorkspaceId } from "@/lib/giselle-data";

export function WorkspacePath(workspaceId: WorkspaceId) {
	return `${workspaceId}/workspace.json`;
}
