import { testWorkspace } from "@/lib/test-utils";
import { describe, expect, test } from "vitest";
import { buildWorkflowMap } from "./build-workflow";
import { buildWorkflowRun } from "./build-workflowrun";

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
