import type { StepRun } from "@/lib/giselle-data";
import { useCompletion } from "ai/react";
import { useEffect } from "react";
import { useWorkflowRunner } from "./context/workflow-runner";

export function WorkflowRunner() {
	const { steps, completeStep } = useWorkflowRunner();
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
		onFinish(_, completion) {
			updateStep(step, {
				result: completion,
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
	}, [step, startStep, handleSubmit]);
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
