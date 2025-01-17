import type {
	JobRun,
	JobRunId,
	StepRun,
	WorkflowRun,
} from "@/lib/giselle-data";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import { WorkflowRunner } from "../../workflow-runner";

export interface WorkflowRunnerContextValue {
	workflowRun: WorkflowRun;
	steps: StepRun[];
	start: ReturnType<typeof WorkflowRunner>["start"];
	startJob: ReturnType<typeof WorkflowRunner>["startJob"];
	startStep: ReturnType<typeof WorkflowRunner>["startStep"];
	updateStep: ReturnType<typeof WorkflowRunner>["updateStep"];
	completeStep: ReturnType<typeof WorkflowRunner>["completeStep"];
}

export const WorkflowRunnerContext =
	createContext<WorkflowRunnerContextValue | null>(null);

export function WorkflowRunnerProvider({
	defaultWorkflowRun,
	children,
}: { children: React.ReactNode; defaultWorkflowRun: WorkflowRun }) {
	const workflowRunnerRef = useRef(WorkflowRunner(defaultWorkflowRun));
	const [workflowRun, setWorkflowRun] = useState(defaultWorkflowRun);
	const start = useCallback(() => {
		workflowRunnerRef.current.start();
		setWorkflowRun(workflowRunnerRef.current.getData());
	}, []);

	const startJob = useCallback((startJobRun: JobRun) => {
		workflowRunnerRef.current.startJob(startJobRun);
		setWorkflowRun(workflowRunnerRef.current.getData());
	}, []);

	const startStep = useCallback((startStepRun: StepRun) => {
		workflowRunnerRef.current.startStep(startStepRun);
		setWorkflowRun(workflowRunnerRef.current.getData());
	}, []);

	const updateStep = useCallback((stepRun: StepRun, data: Partial<StepRun>) => {
		workflowRunnerRef.current.updateStep(stepRun, data);
		setWorkflowRun(workflowRunnerRef.current.getData());
	}, []);

	const completeStep = useCallback((completeStepRun: StepRun) => {
		workflowRunnerRef.current.completeStep(completeStepRun);
		setWorkflowRun(workflowRunnerRef.current.getData());
	}, []);

	const steps = useMemo(() => {
		const stepSet = new Set<StepRun>();

		for (const jobRun of workflowRun.jobRunMap.values()) {
			for (const stepRun of jobRun.stepRunMap.values()) {
				stepSet.add(stepRun);
			}
		}
		return Array.from(stepSet);
	}, [workflowRun]);

	return (
		<WorkflowRunnerContext.Provider
			value={{
				workflowRun,
				start,
				startJob,
				startStep,
				updateStep,
				completeStep,
				steps,
			}}
		>
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
