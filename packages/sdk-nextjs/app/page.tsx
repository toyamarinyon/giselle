"use client";

import { useCreateWorkspace } from "@/lib/workflow-designer";
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();

	const { createWorkspace } = useCreateWorkspace({
		onWorkspaceCreated: ({ workspace }) => {
			router.push(`/workspaces/${workspace.id}`);
		},
	});
	return (
		<button type="button" onClick={createWorkspace}>
			Create workspace
		</button>
	);
}
