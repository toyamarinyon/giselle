import type {
	JobRunId,
	StepRunId,
	WorkflowId,
	WorkflowRunId,
	WorkspaceId,
} from "@/lib/giselle-data";
import { Input } from "@/lib/giselle-engine/core/handlers/run-step";

export async function callRunStepApi({
	api = "/api/giselle/run-step",
	workspaceId,
	workflowId,
	workflowRunId,
	jobRunId,
	stepRunId,
}: {
	api?: string;
	workspaceId: WorkspaceId;
	workflowId: WorkflowId;
	workflowRunId: WorkflowRunId;
	jobRunId: JobRunId;
	stepRunId: StepRunId;
}) {
	const response = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(
			Input.parse({
				workspaceId,
				workflowId,
				workflowRunId,
				jobRunId,
				stepRunId,
			}),
		),
	});
	const data = await response.json();
	return data;
}
