import { testWorkspace } from "@/lib/test-utils";
import { describe, expect, test } from "vitest";
import { buildWorkflowMap } from "./build-workflow";

describe("buildWorkflowMap", () => {
	const workflowMap = buildWorkflowMap(
		testWorkspace.nodeMap,
		testWorkspace.connectionMap,
		testWorkspace.id,
	);
	test("testWorkspace can build 3 workflows", () => {
		expect(workflowMap.size).toBe(3);
	});
	test("first workflow has 3 jobs", () => {
		const workflowIterator = workflowMap.values();
		const firstWorkflow = workflowIterator.next().value;
		expect(firstWorkflow?.jobMap.size).toBe(3);
	});
	test("first workflow`s first job has 2 steps", () => {
		const workflowIterator = workflowMap.values();
		const firstWorkflow = workflowIterator.next().value;
		const jobIterator = firstWorkflow?.jobMap.values();
		const firstJob = jobIterator?.next().value;
		expect(firstJob?.stepMap.size).toBe(2);
	});
});
