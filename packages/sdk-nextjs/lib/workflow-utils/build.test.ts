import { describe, expect, test } from "vitest";
import { buildWorkflowMap, buildWorkflowRun } from "./build";
import { testWorkspace } from "./tests/fixtures";

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
});

describe("buildWorkflowRun", () => {
	const workflowMap = buildWorkflowMap(
		testWorkspace.nodeMap,
		testWorkspace.connectionMap,
		testWorkspace.id,
	);
	const workflowIterator = workflowMap.values();
	const firstWorkflow = workflowIterator.next().value;
	if (firstWorkflow === undefined) {
		throw new Error("firstWorkflow is undefined");
	}
	test("id is string", () => {
		expect(typeof buildWorkflowRun(firstWorkflow).id).toBe("string");
	});
});
