import { Workspace, type WorkspaceId } from "../giselle-data";
import { Output } from "../giselle-engine/core/handlers/get-workspace";

export async function callGetWorkspaceApi({
	host = process.env.NEXT_PUBLIC_VERCEL_URL ?? "localhost:3000",
	api = "/api/giselle/get-workspace",
	workspaceId,
}: {
	api?: string;
	host?: string;
	workspaceId: WorkspaceId;
}) {
	const response = await fetch(`http://${host}${api}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ workspaceId }),
	});
	const json = await response.json();
	const output = Output.parse(json);
	return Workspace.parse(output.workspace);
}
