import { describe, expect, test } from "vitest";
import { buildWorkflowMap } from "./build";
import { testWorkspace } from "./tests/fixtures";

describe("buildWorkflowMap", () => {
	const workflowMap = buildWorkflowMap(
		testWorkspace.nodeMap,
		testWorkspace.connectionMap,
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
