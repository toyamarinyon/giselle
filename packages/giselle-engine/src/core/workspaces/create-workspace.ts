import { Workspace, generateInitialWorkspace } from "@giselle-sdk/data-type";
import { setWorkspace } from "../helpers";
import type { GiselleEngineContext } from "../types";

export async function createWorkspace(args: { context: GiselleEngineContext }) {
	const workspace = generateInitialWorkspace();
	await setWorkspace({
		storage: args.context.storage,
		workspaceId: workspace.id,
		workspace: Workspace.parse(workspace),
	});
	return workspace;
}
