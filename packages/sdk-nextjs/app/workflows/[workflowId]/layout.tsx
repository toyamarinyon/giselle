import { workflowId } from "@/lib/workflow-data";
import {
	WorkflowDesignerProvider,
	callGetWorkflowApi,
} from "@/lib/workflow-designer";
import type { ReactNode } from "react";
import "@xyflow/react/dist/style.css";

export default async function Layout({
	params,
	children,
}: {
	params: Promise<{ workflowId: string }>;
	children: ReactNode;
}) {
	const data = await callGetWorkflowApi({
		workflowId: workflowId.parse((await params).workflowId),
	});
	return (
		<WorkflowDesignerProvider data={data}>{children}</WorkflowDesignerProvider>
	);
}
