import { describe, expect, test } from "vitest";
import type { z } from "zod";
import { renameActionToOperation } from "./rename-action-to-operation";

describe("renameActionToOperation", () => {
	test("should convert node type from action to operation", () => {
		const oldData = {
			nodes: [
				{
					id: "node1",
					type: "action",
					content: {
						type: "text-generation",
						model: "claude-3-5-sonnet",
					},
				},
			],
		};

		const issue: z.ZodIssue = {
			code: "invalid_literal",
			expected: "operation",
			received: "action",
			path: ["nodes", 0, "type"],
			message: 'Invalid literal value, expected "operation"',
		};

		const result = renameActionToOperation(oldData, issue);
		expect(result.nodes[0].type).toBe("operation");
	});

	test("should convert actionNode to operationNode in generation context", () => {
		const oldData = {
			generationContext: {
				actionNode: {
					id: "action1",
					type: "action",
					content: {
						type: "text-generation",
						model: "claude-3-5-sonnet",
					},
				},
				sourceNodes: [],
				origin: { type: "user" },
			},
		};

		const issue: z.ZodIssue = {
			code: "invalid_union_discriminator",
			options: ["operationNode"],
			path: ["generationContext", "actionNode"],
			message: "Invalid discriminator value. Expected 'operationNode'",
		};

		const result = renameActionToOperation(oldData, issue);
		expect(result.generationContext.operationNode).toEqual(
			oldData.generationContext.actionNode,
		);
		expect(result.generationContext.actionNode).toBeUndefined();
	});

	test("should convert actions array to operations in job", () => {
		const oldData = {
			job: {
				id: "job1",
				workflowId: "wf1",
				actions: [
					{
						node: { id: "node1", type: "action" },
						generationTemplate: {
							actionNode: { id: "node1", type: "action" },
							sourceNodes: [],
						},
					},
				],
			},
		};

		const issue: z.ZodIssue = {
			code: "invalid_type",
			expected: "array",
			received: "undefined",
			path: ["job", "operations"],
			message: "Required",
		};

		const result = renameActionToOperation(oldData, issue);
		expect(result.job.operations).toEqual(oldData.job.actions);
		expect(result.job.actions).toBeUndefined();
	});

	test("should not modify unrelated data", () => {
		const oldData = {
			unrelated: "data",
		};

		const issue: z.ZodIssue = {
			code: "invalid_type",
			expected: "string",
			received: "number",
			path: ["someOtherField"],
			message: "Expected string, received number",
		};

		const result = renameActionToOperation(oldData, issue);
		expect(result).toEqual(oldData);
	});

	test("should handle complex nested workflow structures", () => {
		const oldData = {
			editingWorkflows: [
				{
					id: "workflow1",
					nodes: [
						{
							id: "node1",
							type: "action",
							content: { type: "text-generation" },
						},
						{
							id: "node2",
							type: "action",
							content: { type: "image-generation" },
						},
						{ id: "node3", type: "variable", content: { type: "text" } },
					],
					connections: [
						{
							id: "conn1",
							outputNode: { id: "node1", type: "action" },
							inputNode: { id: "node2", type: "action" },
						},
					],
					jobs: [
						{
							id: "job1",
							workflowId: "workflow1",
							actions: [
								{
									node: { id: "node1", type: "action" },
									generationTemplate: {
										actionNode: { id: "node1", type: "action" },
										sourceNodes: [],
									},
								},
							],
						},
					],
				},
			],
		};

		const issue: z.ZodIssue = {
			code: "invalid_union_discriminator",
			options: ["operation", "variable"],
			path: ["editingWorkflows", 0, "nodes", 0, "type"],
			message: "Invalid discriminator value. Expected 'operation' | 'variable'",
		};

		const result = renameActionToOperation(oldData, issue);

		// Check deep node conversions
		expect(result.editingWorkflows[0].nodes[0].type).toBe("operation");
		expect(result.editingWorkflows[0].nodes[1].type).toBe("operation");
		expect(result.editingWorkflows[0].nodes[2].type).toBe("variable"); // should remain unchanged

		// Check node references in connections
		expect(result.editingWorkflows[0].connections[0].outputNode.type).toBe(
			"operation",
		);
		expect(result.editingWorkflows[0].connections[0].inputNode.type).toBe(
			"operation",
		);

		// Check jobs structure
		expect(result.editingWorkflows[0].jobs[0].operations).toBeDefined();
		expect(result.editingWorkflows[0].jobs[0].actions).toBeUndefined();

		// Check generationTemplate conversion
		expect(
			result.editingWorkflows[0].jobs[0].operations[0].generationTemplate
				.operationNode,
		).toBeDefined();
		expect(
			result.editingWorkflows[0].jobs[0].operations[0].generationTemplate
				.actionNode,
		).toBeUndefined();
	});

	test("should handle missing operationNode in generation template", () => {
		const oldData = {
			editingWorkflows: [
				{
					id: "workflow1",
					jobs: [
						{
							id: "job1",
							operations: [
								{
									node: { id: "node1", type: "operation" },
									generationTemplate: {
										// Missing operationNode, but has actionNode
										actionNode: { id: "node1", type: "action" },
										sourceNodes: [],
									},
								},
							],
						},
					],
				},
			],
		};

		const issue: z.ZodIssue = {
			code: "invalid_type",
			expected: "object",
			received: "undefined",
			path: [
				"editingWorkflows",
				0,
				"jobs",
				0,
				"operations",
				0,
				"generationTemplate",
				"operationNode",
			],
			message: "Required",
		};

		const result = renameActionToOperation(oldData, issue);

		// Check that the actionNode was migrated to operationNode
		expect(
			result.editingWorkflows[0].jobs[0].operations[0].generationTemplate
				.operationNode,
		).toBeDefined();
		expect(
			result.editingWorkflows[0].jobs[0].operations[0].generationTemplate
				.operationNode.id,
		).toBe("node1");
		expect(
			result.editingWorkflows[0].jobs[0].operations[0].generationTemplate
				.operationNode.type,
		).toBe("operation");
		expect(
			result.editingWorkflows[0].jobs[0].operations[0].generationTemplate
				.actionNode,
		).toBeUndefined();
	});

	test("should handle template with missing operationNode but with node", () => {
		// Based on the error pattern example
		const oldData = {
			editingWorkflows: [
				{
					id: "wf-VwoKhoI9D6FgVBAk",
					jobs: [
						{
							id: "jb-KffhF6BTKpWdLxN9",
							workflowId: "wf-UHZtRzv3XvrFdV3r",
							operations: [
								{
									node: {
										id: "nd-IhlTHk2HY7m3x9MJ",
										type: "operation",
										content: { type: "textGeneration" },
									},
									generationTemplate: {
										// Missing operationNode completely (not even as actionNode)
										sourceNodes: [],
									},
								},
							],
						},
					],
				},
			],
		};

		const issue: z.ZodIssue = {
			code: "invalid_type",
			expected: "object",
			received: "undefined",
			path: [
				"editingWorkflows",
				0,
				"jobs",
				0,
				"operations",
				0,
				"generationTemplate",
				"operationNode",
			],
			message: "Required",
		};

		const result = renameActionToOperation(oldData, issue);

		// Check that operation.node was copied to generationTemplate.operationNode
		expect(
			result.editingWorkflows[0].jobs[0].operations[0].generationTemplate
				.operationNode,
		).toBeDefined();

		// Should be the same as the node from the operation
		expect(
			result.editingWorkflows[0].jobs[0].operations[0].generationTemplate
				.operationNode,
		).toEqual(oldData.editingWorkflows[0].jobs[0].operations[0].node);
	});
});
