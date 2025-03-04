import { createHandler } from "../create-handler";
import { createWorkspace } from "../workspaces/create-workspace";

export const createWorkspaceHandler = createHandler({
	handler: async ({ context }) => {
		await createWorkspace({
			context,
		});
	},
});
