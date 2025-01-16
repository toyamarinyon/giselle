import type { WorkspaceId } from "@/lib/workflow-data";

export function WorkspacePath(workspaceId: WorkspaceId) {
	return `${workspaceId}/workspace.json`;
}
