import { Output } from "../giselle-engine/core/handlers/create-workspace";
import { Workspace } from "../workflow-data";

export async function callCreateWorkspaceApi({
	api = "/api/giselle/create-workspace",
}: {
	api?: string;
} = {}) {
	const response = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({}),
	});
	const data = await response.json();
	const output = Output.parse(data);
	return Workspace.parse(output.Workspace);
}
