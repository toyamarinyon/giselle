import type { JobRun, JobRunId, WorkflowRun } from "@/lib/giselle-data";

export function WorkflowRunner(defaultWorkflowRun: WorkflowRun) {
	const workflowRun = defaultWorkflowRun;
	function startNextJob(currentJobRunId: JobRunId) {
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
				stepRun.status = "queued";
			}
		}
	}
}
