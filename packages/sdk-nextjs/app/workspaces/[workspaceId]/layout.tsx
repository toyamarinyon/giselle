import { WorkspaceId } from "@/lib/giselle-data";
import { callGetWorkspaceApi } from "@/lib/ui-utils";
import { WorkflowDesignerProvider } from "@/lib/workflow-designer/react";
import type { ReactNode } from "react";
import "@xyflow/react/dist/style.css";
import "@/lib/workflow-designer/react/editor/style.css";

export default async function Layout({
	params,
	children,
}: {
	params: Promise<{ workspaceId: string }>;
	children: ReactNode;
}) {
	const data = await callGetWorkspaceApi({
		workspaceId: WorkspaceId.parse((await params).workspaceId),
	});
	return (
		<WorkflowDesignerProvider data={data}>{children}</WorkflowDesignerProvider>
	);
}
