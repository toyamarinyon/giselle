import {
	JobRunId,
	StepRunId,
	WorkflowId,
	WorkflowRunId,
	WorkspaceId,
} from "@/lib/giselle-data";
import { isTextGenerationNode } from "@/lib/giselle-data/node/actions/text-generation";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import { createContextMapFrom, createContextProviderTool } from "../../tools";
import { getWorkspace } from "../helpers/get-workspace";
import type { WorkspaceEngineHandlerArgs } from "./types";

export const Input = z.object({
	workspaceId: WorkspaceId.schema,
	workflowId: WorkflowId.schema,
	workflowRunId: WorkflowRunId.schema,
	jobRunId: JobRunId.schema,
	stepRunId: StepRunId.schema,
});

export async function runStep({
	unsafeInput,
	context,
}: WorkspaceEngineHandlerArgs<z.infer<typeof Input>>) {
	const input = Input.parse(unsafeInput);
	const workspace = await getWorkspace({
		storage: context.storage,
		workspaceId: input.workspaceId,
	});
	const workflowRun = workspace.workflowRunMap.get(input.workflowRunId);
	const jobRun = workflowRun?.jobRunMap.get(input.jobRunId);
	const stepRun = jobRun?.stepRunMap.get(input.stepRunId);
	if (
		workflowRun === undefined ||
		jobRun === undefined ||
		stepRun === undefined
	) {
		throw new Error("Workflow run, job run, or step run not found");
	}

	const workflow = workspace.workflowMap.get(workflowRun.workflowId);
	const job = workflow?.jobMap.get(jobRun.jobId);
	const step = job?.stepMap.get(stepRun.stepId);

	if (workflow === undefined || job === undefined || step === undefined) {
		throw new Error("Workflow, job, or step not found");
	}
	const node = workflow.nodeMap.get(step.nodeId);

	if (node === undefined) {
		throw new Error("Node not found");
	}

	if (!isTextGenerationNode(node)) {
		throw new Error("not implemented");
	}
	const contextMap = createContextMapFrom(node, workspace.nodeMap);
	const system =
		contextMap.size === 0
			? ""
			: `first, check the sources: ${Array.from(contextMap.keys()).join(",")} then, achieve the user request`;
	const stream = streamText({
		model: openai("gpt-4o"),
		prompt: node.content.prompt,
		system,
		tools: { ...createContextProviderTool(contextMap) },
		maxSteps: 10,
	});
	return stream;
}
