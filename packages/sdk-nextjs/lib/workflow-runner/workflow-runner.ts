import type {
	JobRun,
	JobRunId,
	StepRun,
	StepRunId,
	WorkflowRun,
} from "@/lib/giselle-data";

export function WorkflowRunner(defaultWorkflowRun: WorkflowRun) {
	const workflowRun = defaultWorkflowRun;
	function start() {
		workflowRun.status = "inProgress";
		for (const [_, job] of workflowRun.jobRunMap) {
			job.status = "queued";
			for (const [_, stepRun] of job.stepRunMap) {
				stepRun.status = "queued";
			}
			break;
		}
	}
	function startJob(startJobRun: JobRun) {
		const jobRun = workflowRun.jobRunMap.get(startJobRun.id);
		if (jobRun === undefined) {
			throw new Error(`JobRun with id ${startJobRun.id} not found`);
		}
		jobRun.status = "inProgress";
	}
	function completeJob(completeJobRun: JobRun) {
		const jobRun = workflowRun.jobRunMap.get(completeJobRun.id);
		if (jobRun === undefined) {
			throw new Error(`JobRun with id ${completeJobRun.id} not found`);
		}
		jobRun.status = "completed";
		queueingNextJob(jobRun);
	}
	function startStep(startStepRun: StepRun) {
		const jobRun = workflowRun.jobRunMap.get(startStepRun.jobRunId);
		if (jobRun === undefined) {
			throw new Error(`JobRun with id ${startStepRun.jobRunId} not found`);
		}
		const stepRun = jobRun.stepRunMap.get(startStepRun.id);
		if (stepRun === undefined) {
			throw new Error(`StepRun with id ${startStepRun.id} not found`);
		}
		stepRun.status = "inProgress";
	}
	function completeStep(completeStepRun: StepRun) {
		const jobRun = workflowRun.jobRunMap.get(completeStepRun.jobRunId);
		if (jobRun === undefined) {
			throw new Error(`JobRun with id ${completeStepRun.jobRunId} not found`);
		}
		const stepRun = jobRun.stepRunMap.get(completeStepRun.id);
		if (stepRun === undefined) {
			throw new Error(`StepRun with id ${completeStepRun.id} not found`);
		}
		stepRun.status = "completed";

		const allStepCompleted = Array.from(jobRun.stepRunMap.values()).every(
			(stepRun) => stepRun.status === "completed",
		);
		if (allStepCompleted) {
			completeJob(jobRun);
		}
	}
	function queueingNextJob(currentJobRun: JobRun) {
		let found = false;
		let nextJob: JobRun | undefined;

		for (const [jobRunId, job] of workflowRun.jobRunMap) {
			if (jobRunId === currentJobRun.id) {
				found = true;
				continue;
			}
			if (found) {
				nextJob = job;
				break;
			}
		}

		if (nextJob) {
			nextJob.status = "queued";
			for (const [_, stepRun] of nextJob.stepRunMap) {
				stepRun.status = "queued";
			}
		}
	}
	function getData() {
		return workflowRun;
	}

	return {
		start,
		startJob,
		completeJob,
		startStep,
		completeStep,
		queueingNextJob,
		getData,
	};
}
