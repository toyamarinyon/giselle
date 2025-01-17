import type {
	WorkflowRunId,
	WorkspaceId,
	WorkspaceJson,
} from "@/lib/giselle-data";
import type { Storage } from "unstorage";
import { workflowRunPath } from "./workspace-path";

export async function setWorkflowRun({
	workspaceId,
	workflowRunId,
}: {
	storage: Storage;
	workspaceId: WorkspaceId;
	workflowRunId: WorkflowRunId;
	workspace: WorkspaceJson;
}) {
	workflowRunPath(workspaceId, workflowRunId);
}
