import {
	type Workspace,
	type WorkspaceId,
	WorkspaceJson,
} from "../giselle-data";
import { Output } from "../giselle-engine/core/handlers/save-workspace";

export async function callSaveWorkspaceApi({
	api = "/api/giselle/save-workspace",
	workspaceId,
	workspace,
}: {
	api?: string;
	workspaceId: WorkspaceId;
	workspace: Workspace;
}) {
	const response = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			workspaceId,
			workspace: WorkspaceJson.parse(workspace),
		}),
	});
	const data = await response.json();
	return Output.parse(data);
}
