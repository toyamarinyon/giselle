import { WorkspaceId } from "@/lib/workflow-data";
import {
	WorkflowDesignerProvider,
	callGetWorkspaceApi,
} from "@/lib/workflow-designer";
import type { ReactNode } from "react";
import "@xyflow/react/dist/style.css";
import "@/lib/workflow-designer/ui/editor/style.css";

export default async function Layout({
	params,
	children,
}: {
	params: Promise<{ workspaceId: string }>;
	children: ReactNode;
}) {
	const data = await callGetWorkspaceApi({
		workflowId: WorkspaceId.parse((await params).workspaceId),
	});
	return (
		<WorkflowDesignerProvider data={data}>{children}</WorkflowDesignerProvider>
	);
}
