import { describe, expect, test } from "vitest";
import { JobRunStatus, WorkflowRunStatus } from "../giselle-data/workflow-run";
import { testWorkspace } from "../test-utils";
import { buildWorkflowMap, buildWorkflowRun } from "../workflow-utils";
import { WorkflowRunner } from "./workflow-runner";

describe("workflow-runner", () => {
	const workflowMap = buildWorkflowMap(
		testWorkspace.nodeMap,
		testWorkspace.connectionMap,
		testWorkspace.id,
	);
	const workflow = workflowMap.values().next().value;
	if (workflow === undefined) {
		throw new Error("workflow is undefined");
	}
	const workflowRun = buildWorkflowRun(workflow);
	const workflowRunner = WorkflowRunner(workflowRun);

	test("toBeDefined", () => {
		expect(workflowRunner).toBeDefined();
	});

	test("start", () => {
		expect(workflowRunner.getData().status).toBe(WorkflowRunStatus.Enum.queued);
		workflowRunner.start();
		const data = workflowRunner.getData();
		expect(data.status).toBe(WorkflowRunStatus.Enum.inProgress);
		const jobRunIterator = data.jobRunMap.values();
		const firstJobRun = jobRunIterator.next().value;
		if (firstJobRun === undefined) {
			throw new Error("firstJobRun is undefined");
		}
		expect(firstJobRun.status).toBe(JobRunStatus.Enum.inProgress);
		for (const stepRun of firstJobRun.stepRunMap.values()) {
			expect(stepRun.status).toBe(JobRunStatus.Enum.inProgress);
		}
		const secondJobRun = jobRunIterator.next().value;
		if (secondJobRun === undefined) {
			throw new Error("firstJobRun is undefined");
		}
		expect(secondJobRun.status).toBe(JobRunStatus.Enum.waiting);
		for (const stepRun of secondJobRun.stepRunMap.values()) {
			expect(stepRun.status).toBe(JobRunStatus.Enum.waiting);
		}
	});

	test("startJob", () => {
		const firstJob = workflowRun.jobRunMap.values().next().value;
		if (firstJob === undefined) {
			throw new Error("firstJob is undefined");
		}
		workflowRunner.startJob(firstJob);
		const data = workflowRunner.getData();
		expect(data.status).toBe(WorkflowRunStatus.Enum.inProgress);
		const jobRunIterator = data.jobRunMap.values();
		const firstJobRun = jobRunIterator.next().value;
		if (firstJobRun === undefined) {
			throw new Error("firstJobRun is undefined");
		}
		expect(firstJobRun.status).toBe(JobRunStatus.Enum.inProgress);
		for (const stepRun of firstJobRun.stepRunMap.values()) {
			expect(stepRun.status).toBe(JobRunStatus.Enum.inProgress);
		}
		const secondJobRun = jobRunIterator.next().value;
		if (secondJobRun === undefined) {
			throw new Error("firstJobRun is undefined");
		}
		expect(secondJobRun.status).toBe(JobRunStatus.Enum.waiting);
		for (const stepRun of secondJobRun.stepRunMap.values()) {
			expect(stepRun.status).toBe(JobRunStatus.Enum.waiting);
		}
	});
	test("startStep", () => {
		const firstJob = workflowRun.jobRunMap.values().next().value;
		if (firstJob === undefined) {
			throw new Error("firstJob is undefined");
		}
		const firstStep = firstJob.stepRunMap.values().next().value;
		if (firstStep === undefined) {
			throw new Error("firstStep is undefined");
		}
		workflowRunner.startStep(firstStep);
		const data = workflowRunner.getData();
		expect(data.status).toBe(WorkflowRunStatus.Enum.inProgress);
		const jobRunIterator = data.jobRunMap.values();
		const firstJobRun = jobRunIterator.next().value;
		if (firstJobRun === undefined) {
			throw new Error("firstJobRun is undefined");
		}
		expect(firstJobRun.status).toBe(JobRunStatus.Enum.inProgress);
		const firstStepRun = firstJobRun.stepRunMap.values().next().value;
		if (firstStepRun === undefined) {
			throw new Error("firstStepRun is undefined");
		}
		expect(firstStepRun.status).toBe(JobRunStatus.Enum.inProgress);
		const secondJobRun = jobRunIterator.next().value;
		if (secondJobRun === undefined) {
			throw new Error("secondJobRun is undefined");
		}
		expect(secondJobRun.status).toBe(JobRunStatus.Enum.waiting);
		for (const stepRun of secondJobRun.stepRunMap.values()) {
			expect(stepRun.status).toBe(JobRunStatus.Enum.waiting);
		}
	});
	test("completeStep", () => {
		const firstJob = workflowRun.jobRunMap.values().next().value;
		if (firstJob === undefined) {
			throw new Error("firstJob is undefined");
		}
		workflowRunner.startJob(firstJob);
		for (const stepRun of firstJob.stepRunMap.values()) {
			workflowRunner.startStep(stepRun);
		}
		const firstStep = firstJob.stepRunMap.values().next().value;
		if (firstStep === undefined) {
			throw new Error("firstStep is undefined");
		}
		workflowRunner.completeStep(firstStep);
		const data = workflowRunner.getData();
		expect(data.status).toBe(WorkflowRunStatus.Enum.inProgress);
		const jobRunIterator = data.jobRunMap.values();
		const firstJobRun = jobRunIterator.next().value;
		if (firstJobRun === undefined) {
			throw new Error("firstJobRun is undefined");
		}
		const stepRunIterator = firstJobRun.stepRunMap.values();
		expect(firstJobRun.status).toBe(JobRunStatus.Enum.inProgress);
		const firstStepRun = stepRunIterator.next().value;
		if (firstStepRun === undefined) {
			throw new Error("firstStepRun is undefined");
		}
		expect(firstStepRun.status).toBe(JobRunStatus.Enum.completed);
		const secondStepRun = stepRunIterator.next().value;
		if (secondStepRun === undefined) {
			throw new Error("secondStepRun is undefined");
		}
		expect(secondStepRun.status).toBe(JobRunStatus.Enum.inProgress);
		const secondJobRun = jobRunIterator.next().value;
		if (secondJobRun === undefined) {
			throw new Error("secondJobRun is undefined");
		}
		expect(secondJobRun.status).toBe(JobRunStatus.Enum.waiting);
		for (const stepRun of secondJobRun.stepRunMap.values()) {
			expect(stepRun.status).toBe(JobRunStatus.Enum.waiting);
		}
	});
	test("completeAllStep", () => {
		const firstJob = workflowRun.jobRunMap.values().next().value;
		if (firstJob === undefined) {
			throw new Error("firstJob is undefined");
		}
		workflowRunner.startJob(firstJob);
		for (const stepRun of firstJob.stepRunMap.values()) {
			workflowRunner.startStep(stepRun);
			workflowRunner.completeStep(stepRun);
		}
		const firstStep = firstJob.stepRunMap.values().next().value;
		if (firstStep === undefined) {
			throw new Error("firstStep is undefined");
		}
		const data = workflowRunner.getData();
		expect(data.status).toBe(WorkflowRunStatus.Enum.inProgress);
		const jobRunIterator = data.jobRunMap.values();
		const firstJobRun = jobRunIterator.next().value;
		if (firstJobRun === undefined) {
			throw new Error("firstJobRun is undefined");
		}
		const stepRunIterator = firstJobRun.stepRunMap.values();
		expect(firstJobRun.status).toBe(JobRunStatus.Enum.completed);
		const firstStepRun = stepRunIterator.next().value;
		if (firstStepRun === undefined) {
			throw new Error("firstStepRun is undefined");
		}
		expect(firstStepRun.status).toBe(JobRunStatus.Enum.completed);
		const secondStepRun = stepRunIterator.next().value;
		if (secondStepRun === undefined) {
			throw new Error("secondStepRun is undefined");
		}
		expect(secondStepRun.status).toBe(JobRunStatus.Enum.completed);
		const secondJobRun = jobRunIterator.next().value;
		if (secondJobRun === undefined) {
			throw new Error("secondJobRun is undefined");
		}
		expect(secondJobRun.status).toBe(JobRunStatus.Enum.inProgress);
		for (const stepRun of secondJobRun.stepRunMap.values()) {
			expect(stepRun.status).toBe(JobRunStatus.Enum.queued);
		}
	});
});
