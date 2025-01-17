import type { JobRun, StepRun, WorkflowRun } from "@/lib/giselle-data";
import { useCompletion } from "ai/react";
import { useEffect } from "react";
import { useWorkflowRunner } from "./context/workflow-runner";

export function WorkflowRunner() {
	const { workflowRun, startNextJob } = useWorkflowRunner();

	return (
		<>
			{Array.from(workflowRun.jobRunMap).map(([jobRunId, jobRun]) => (
				<JobRunner
					key={jobRunId}
					jobRun={jobRun}
					onComplete={() => {
						startNextJob(jobRunId);
					}}
				/>
			))}
		</>
	);
}

function JobRunner({
	jobRun,
	onComplete,
}: {
	jobRun: JobRun;
	onComplete: () => void;
}) {
	return Array.from(jobRun.stepRunMap).map(([stepRunId, stepRun]) => (
		<StepRunner
			key={stepRunId}
			stepRun={stepRun}
			onComplete={() => {
				const allStepCompleted = Array.from(jobRun.stepRunMap.values()).every(
					(stepRun) => stepRun.status === "completed",
				);
				if (allStepCompleted) {
					onComplete();
				}
			}}
		/>
	));
}

function StepRunner({
	stepRun,
	onComplete,
}: {
	stepRun: StepRun;
	onComplete: () => void;
}) {
	const { updateStepRun } = useWorkflowRunner();
	const { handleSubmit, completion } = useCompletion({
		onFinish() {
			updateStepRun(stepRun, {
				status: "completed",
			});
			onComplete();
		},
	});
	useEffect(() => {
		if (stepRun.status !== "queued") {
			return;
		}
		updateStepRun(stepRun, {
			status: "inProgress",
		});
		handleSubmit();
	}, [stepRun, handleSubmit, updateStepRun]);
	useEffect(() => {
		if (stepRun.status !== "inProgress") {
			return;
		}
		updateStepRun(stepRun, {
			result: completion,
		});
	}, [stepRun, updateStepRun, completion]);
	return null;
}
