import { useCallback } from "react";
import type { Workspace } from "../workflow-data";
import { callCreateWorkspaceApi } from "./call-create-workspace-api";

export function useCreateWorkspace({
	onWorkspaceCreated,
}: {
	onWorkspaceCreated?: (params: { workspace: Workspace }) => void;
} = {}) {
	const createWorkspace = useCallback(async () => {
		const workspace = await callCreateWorkspaceApi();
		onWorkspaceCreated?.({ workspace });
	}, [onWorkspaceCreated]);
	return {
		createWorkspace,
	};
}
