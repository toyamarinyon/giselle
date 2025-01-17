import type {
	JobRun,
	JobRunId,
	StepRun,
	StepRunId,
	WorkflowRun,
} from "@/lib/giselle-data";
import { createContext, useContext, useState } from "react";

export interface WorkflowRunnerContextValue {
	workflowRun: WorkflowRun;
	updateStepRun: (stepRun: StepRun, data: Partial<StepRun>) => void;
	startNextJob: (jobRunId: JobRunId) => void;
}

export const WorkflowRunnerContext =
	createContext<WorkflowRunnerContextValue | null>(null);

export function WorkflowRunnerProvider({
	defaultWorkflowRun,
	children,
}: { children: React.ReactNode; defaultWorkflowRun: WorkflowRun }) {
	const [workflowRun, setWorkflowRun] = useState(defaultWorkflowRun);

	const startNextJob = (currentJobRunId: JobRunId) => {
		let found = false;
		let nextJob: JobRun | undefined;

		for (const [jobRunId, job] of workflowRun.jobRunMap) {
			if (jobRunId === currentJobRunId) {
				found = true;
				continue;
			}
			if (found) {
				nextJob = job;
				break;
			}
		}

		if (nextJob) {
			for (const [stepRunId, stepRun] of nextJob.stepRunMap) {
			}
		}
	};

	return (
		<WorkflowRunnerContext.Provider value={null}>
			{children}
		</WorkflowRunnerContext.Provider>
	);
}

export function useWorkflowRunner() {
	const context = useContext(WorkflowRunnerContext);
	if (context === null) {
		throw new Error(
			"useWorkflowRunner must be used within a WorkflowRunnerProvider",
		);
	}
	return context;
}
