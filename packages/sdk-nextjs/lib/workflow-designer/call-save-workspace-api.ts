import {
	type Workspace,
	type WorkspaceId,
	WorkspaceJson,
} from "../giselle-data";
import { Output } from "../giselle-engine/core/handlers/save-workspace";

export async function callSaveWorkflowApi({
	api = "/api/giselle/save-workspace",
	workflowId,
	Workspace,
}: {
	api?: string;
	workflowId: WorkspaceId;
	Workspace: Workspace;
}) {
	const response = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			workflowId,
			Workspace: WorkspaceJson.parse(Workspace),
		}),
	});
	const data = await response.json();
	return Output.parse(data);
}
