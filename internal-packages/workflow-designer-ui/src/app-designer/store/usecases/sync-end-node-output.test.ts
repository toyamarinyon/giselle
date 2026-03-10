import {
	type EndOutput,
	NodeId,
	OutputId,
	type Schema,
} from "@giselles-ai/protocol";
import { describe, expect, it } from "vitest";
import { syncEndNodeOutput } from "./sync-end-node-output";

describe("syncEndNodeOutput", () => {
	describe("whole object mapping", () => {
		it("follows when text gen node renames a property", () => {
			const sourceNodeId = NodeId.generate();
			const sourceOutputId = OutputId.generate();
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "output",
					type: "object",
					properties: {
						summary: {
							type: "object",
							properties: {
								name: { type: "string" },
							},
							required: ["name"],
							additionalProperties: false,
						},
					},
					additionalProperties: false,
					required: ["summary"],
				},
				mappings: [
					{
						path: ["summary"],
						source: {
							nodeId: sourceNodeId,
							outputId: sourceOutputId,
							path: [], // whole object mapping
						},
					},
				],
			};

			// source renames "name" -> "fullName"
			const updatedSourceSchema: Schema = {
				title: "output",
				type: "object",
				properties: {
					fullName: { type: "string" },
				},
				additionalProperties: false,
				required: ["fullName"],
			};

			const result = syncEndNodeOutput(
				endNodeOutput,
				sourceNodeId,
				sourceOutputId,
				updatedSourceSchema,
			);

			// end node's "summary" should mirror the renamed shape
			expect(result?.output.schema.properties.summary).toEqual({
				type: "object",
				properties: { fullName: { type: "string" } },
				required: ["fullName"],
				additionalProperties: false,
			});
			// mapping itself is preserved
			expect(result?.output.mappings).toEqual([
				{
					path: ["summary"],
					source: {
						nodeId: sourceNodeId,
						outputId: sourceOutputId,
						path: [],
					},
				},
			]);
			// no mappings were removed
			expect(result?.removedMappings).toEqual([]);
		});

		it("follows when text gen node changes a property type", () => {
			const sourceNodeId = NodeId.generate();
			const sourceOutputId = OutputId.generate();
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "output",
					type: "object",
					properties: {
						data: {
							type: "object",
							properties: {
								count: { type: "string" },
							},
							required: ["count"],
							additionalProperties: false,
						},
					},
					additionalProperties: false,
					required: ["data"],
				},
				mappings: [
					{
						path: ["data"],
						source: {
							nodeId: sourceNodeId,
							outputId: sourceOutputId,
							path: [], // whole object mapping
						},
					},
				],
			};

			// source changes "count" from string -> number
			const updatedSourceSchema: Schema = {
				title: "output",
				type: "object",
				properties: {
					count: { type: "number" },
				},
				additionalProperties: false,
				required: ["count"],
			};

			const result = syncEndNodeOutput(
				endNodeOutput,
				sourceNodeId,
				sourceOutputId,
				updatedSourceSchema,
			);

			// end node's "data" should pick up the new type
			expect(result?.output.schema.properties.data).toEqual({
				type: "object",
				properties: { count: { type: "number" } },
				required: ["count"],
				additionalProperties: false,
			});
			// mapping itself is preserved
			expect(result?.output.mappings).toEqual([
				{
					path: ["data"],
					source: {
						nodeId: sourceNodeId,
						outputId: sourceOutputId,
						path: [],
					},
				},
			]);
			// no mappings were removed
			expect(result?.removedMappings).toEqual([]);
		});
	});

	describe("single property mapping", () => {
		it("follows when text gen node changes the property type", () => {
			const sourceNodeId = NodeId.generate();
			const sourceOutputId = OutputId.generate();
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "output",
					type: "object",
					properties: {
						title: { type: "string" },
					},
					additionalProperties: false,
					required: ["title"],
				},
				mappings: [
					{
						path: ["title"],
						source: {
							nodeId: sourceNodeId,
							outputId: sourceOutputId,
							path: ["title"], // single property mapping
						},
					},
				],
			};

			// source changes "title" from string -> number
			const updatedSourceSchema: Schema = {
				title: "output",
				type: "object",
				properties: {
					title: { type: "number" },
				},
				additionalProperties: false,
				required: ["title"],
			};

			const result = syncEndNodeOutput(
				endNodeOutput,
				sourceNodeId,
				sourceOutputId,
				updatedSourceSchema,
			);

			// end node's "title" should follow the type change
			expect(result?.output.schema.properties.title).toEqual({
				type: "number",
			});
			// mapping itself is preserved
			expect(result?.output.mappings).toEqual([
				{
					path: ["title"],
					source: {
						nodeId: sourceNodeId,
						outputId: sourceOutputId,
						path: ["title"],
					},
				},
			]);
			// no mappings were removed
			expect(result?.removedMappings).toEqual([]);
		});

		it("clears the mapping when text gen node renames the property", () => {
			const sourceNodeId = NodeId.generate();
			const sourceOutputId = OutputId.generate();
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "output",
					type: "object",
					properties: {
						title: { type: "string" },
					},
					additionalProperties: false,
					required: ["title"],
				},
				mappings: [
					{
						path: ["title"],
						source: {
							nodeId: sourceNodeId,
							outputId: sourceOutputId,
							path: ["name"], // maps to source's "name"
						},
					},
				],
			};

			// source renames "name" -> "fullName", so mapped path ["name"] no longer exists
			const updatedSourceSchema: Schema = {
				title: "output",
				type: "object",
				properties: {
					fullName: { type: "string" },
				},
				additionalProperties: false,
				required: ["fullName"],
			};

			const result = syncEndNodeOutput(
				endNodeOutput,
				sourceNodeId,
				sourceOutputId,
				updatedSourceSchema,
			);

			// mapping is cleared because the source path disappeared
			expect(result?.output.mappings).toEqual([]);
			// end node's "title" field stays in the schema (unmapped)
			expect(result?.output.schema.properties).toEqual({
				title: { type: "string" },
			});
			// the removed mapping is reported
			expect(result?.removedMappings).toHaveLength(1);
			expect(result?.removedMappings[0].path).toEqual(["title"]);
		});
	});
});
