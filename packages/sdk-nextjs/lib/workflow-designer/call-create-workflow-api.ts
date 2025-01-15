import { WorkflowData } from "../workflow-data";
import { Output } from "../workflow-engine/core/handlers/create-workflow";

export async function callCreateWorkflowApi({
	api = "/api/workflow/create-workflow",
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
	return WorkflowData.parse(output.workflowData);
}
