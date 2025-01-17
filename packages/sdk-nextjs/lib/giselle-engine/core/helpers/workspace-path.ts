import type { WorkflowRunId, WorkspaceId } from "@/lib/giselle-data";

export function workspacePath(workspaceId: WorkspaceId) {
	return `${workspaceId}/workspace.json`;
}

export function workflowRunPath(
	workspaceId: WorkspaceId,
	workflowRunId: WorkflowRunId,
) {
	return `${workspaceId}/workflow-runs/${workflowRunId}.json`;
}
