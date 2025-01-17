import type { JobRun, StepRun, WorkflowRun } from "@/lib/giselle-data";
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
	workflowRun: WorkflowRun | undefined;
	steps: StepRun[];
	start: WorkflowRunner["start"];
	startJob: WorkflowRunner["startJob"];
	startStep: WorkflowRunner["startStep"];
	updateStep: WorkflowRunner["updateStep"];
	completeStep: WorkflowRunner["completeStep"];
	setWorkflowRun: (workflowRun: WorkflowRun) => void;
}

export const WorkflowRunnerContext =
	createContext<WorkflowRunnerContextValue | null>(null);

export function WorkflowRunnerProvider({
	children,
	onWorkflowRunUpdate,
}: {
	children: React.ReactNode;
	onWorkflowRunUpdate?: (workflowRun: WorkflowRun) => void;
}) {
	const workflowRunnerRef = useRef<WorkflowRunner | null>(null);
	const [workflowRun, setWorkflowRunInternal] = useState<
		WorkflowRun | undefined
	>();
	const updateWorkflowRun = useCallback(() => {
		if (workflowRunnerRef.current !== null) {
			const newWorkflowRun = workflowRunnerRef.current.getData();
			setWorkflowRunInternal(newWorkflowRun);
			onWorkflowRunUpdate?.(newWorkflowRun);
		}
	}, [onWorkflowRunUpdate]);
	const start = useCallback(() => {
		workflowRunnerRef.current?.start();
		updateWorkflowRun();
	}, [updateWorkflowRun]);

	const startJob = useCallback(
		(startJobRun: JobRun) => {
			workflowRunnerRef.current?.startJob(startJobRun);
			updateWorkflowRun();
		},
		[updateWorkflowRun],
	);

	const startStep = useCallback(
		(startStepRun: StepRun) => {
			workflowRunnerRef.current?.startStep(startStepRun);
			updateWorkflowRun();
		},
		[updateWorkflowRun],
	);

	const updateStep = useCallback(
		(stepRun: StepRun, data: Partial<StepRun>) => {
			workflowRunnerRef.current?.updateStep(stepRun, data);
			updateWorkflowRun();
		},
		[updateWorkflowRun],
	);

	const completeStep = useCallback(
		(completeStepRun: StepRun) => {
			workflowRunnerRef.current?.completeStep(completeStepRun);
			updateWorkflowRun();
		},
		[updateWorkflowRun],
	);

	const steps = useMemo(() => {
		if (workflowRun === undefined) {
			return [];
		}
		const stepSet = new Set<StepRun>();
		for (const jobRun of workflowRun.jobRunMap.values()) {
			for (const stepRun of jobRun.stepRunMap.values()) {
				stepSet.add(stepRun);
			}
		}
		return Array.from(stepSet);
	}, [workflowRun]);

	const setWorkflowRun = useCallback(
		(workflowRun: WorkflowRun) => {
			workflowRunnerRef.current = WorkflowRunner(workflowRun);
			updateWorkflowRun();
		},
		[updateWorkflowRun],
	);

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
				setWorkflowRun,
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
