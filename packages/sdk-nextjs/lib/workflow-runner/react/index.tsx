import type { StepRun } from "@/lib/giselle-data";
import { useCompletion } from "ai/react";
import { useEffect } from "react";
import {
	WorkflowRunnerProvider,
	useWorkflowRunner,
} from "./context/workflow-runner";

export function WorkflowRunner() {
	const { steps, completeStep, start, workflowRun } = useWorkflowRunner();
	useEffect(() => {
		if (workflowRun?.status === "queued") {
			start();
		}
	}, [start, workflowRun?.status]);
	return steps.map((step) => (
		<StepRunner
			key={step.id}
			step={step}
			onComplete={() => {
				completeStep(step);
			}}
		/>
	));
}

function StepRunner({
	step,
	onComplete,
}: {
	step: StepRun;
	onComplete: () => void;
}) {
	const { updateStep, startStep } = useWorkflowRunner();
	const { handleSubmit, completion } = useCompletion({
		initialInput: "dummy",
		api: "/api/giselle/run-step",
		body: {
			workspaceId: step.workspaceId,
			workflowId: step.workflowId,
			workflowRunId: step.workflowRunId,
			jobRunId: step.jobRunId,
			stepRunId: step.id,
		},
		onFinish() {
			updateStep(step, {
				status: "completed",
			});
			onComplete();
		},
	});
	useEffect(() => {
		if (step.status !== "queued") {
			return;
		}
		startStep(step);
		handleSubmit();
	}, [step, handleSubmit, startStep]);
	useEffect(() => {
		if (step.status !== "inProgress") {
			return;
		}
		updateStep(step, {
			result: completion,
		});
	}, [step, updateStep, completion]);
	return null;
}

export { WorkflowRunnerProvider, useWorkflowRunner };
