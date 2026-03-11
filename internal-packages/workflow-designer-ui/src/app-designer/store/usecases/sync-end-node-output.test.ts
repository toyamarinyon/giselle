import {
	type EndOutput,
	NodeId,
	OutputId,
	type Schema,
} from "@giselles-ai/protocol";
import { describe, expect, it } from "vitest";
import { syncEndNodeOutput } from "./sync-end-node-output";

describe("syncEndNodeOutput", () => {
	describe("whole node mapping", () => {
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
							path: [], // whole node mapping
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
							path: [], // whole node mapping
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

		it("removes the mapping and preserves object type when source schema is empty", () => {
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
								name: { type: "string" },
							},
							required: ["name"],
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
							path: [], // whole node mapping
						},
					},
				],
			};

			// source switches to text (empty schema)
			const emptySourceSchema: Schema = {
				title: "",
				type: "object",
				properties: {},
				additionalProperties: false,
				required: [],
			};

			const result = syncEndNodeOutput(
				endNodeOutput,
				sourceNodeId,
				sourceOutputId,
				emptySourceSchema,
			);

			// end node's "data" keeps its object type (user-configurable)
			expect(result?.output.schema.properties).toEqual({
				data: {
					type: "object",
					properties: { name: { type: "string" } },
					required: ["name"],
					additionalProperties: false,
				},
			});
			// mapping is removed
			expect(result?.output.mappings).toEqual([]);
			// the removed mapping is reported
			expect(result?.removedMappings).toHaveLength(1);
			expect(result?.removedMappings[0].path).toEqual(["data"]);
		});
	});

	describe("property path mapping", () => {
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
							path: ["title"], // property path mapping
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

		it("keeps user-configurable types when clearing a stale mapping", () => {
			const sourceNodeId = NodeId.generate();
			const sourceOutputId = OutputId.generate();
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "output",
					type: "object",
					properties: {
						score: { type: "number" },
					},
					additionalProperties: false,
					required: ["score"],
				},
				mappings: [
					{
						path: ["score"],
						source: {
							nodeId: sourceNodeId,
							outputId: sourceOutputId,
							path: ["score"],
						},
					},
				],
			};

			// source renames "score" -> "points", so mapped path ["score"] no longer exists
			const updatedSourceSchema: Schema = {
				title: "output",
				type: "object",
				properties: {
					points: { type: "number" },
				},
				additionalProperties: false,
				required: ["points"],
			};

			const result = syncEndNodeOutput(
				endNodeOutput,
				sourceNodeId,
				sourceOutputId,
				updatedSourceSchema,
			);

			// mapping is cleared because the source path disappeared
			expect(result?.output.mappings).toEqual([]);
			// end node's "score" keeps its number type (user-configurable)
			expect(result?.output.schema.properties).toEqual({
				score: { type: "number" },
			});
			// the removed mapping is reported
			expect(result?.removedMappings).toHaveLength(1);
			expect(result?.removedMappings[0].path).toEqual(["score"]);
		});

		it("resets enum to plain string when clearing a stale mapping", () => {
			const sourceNodeId = NodeId.generate();
			const sourceOutputId = OutputId.generate();
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "output",
					type: "object",
					properties: {
						status: { type: "string", enum: ["active", "inactive"] },
					},
					additionalProperties: false,
					required: ["status"],
				},
				mappings: [
					{
						path: ["status"],
						source: {
							nodeId: sourceNodeId,
							outputId: sourceOutputId,
							path: ["status"],
						},
					},
				],
			};

			// source renames "status" -> "state", so mapped path ["status"] no longer exists
			const updatedSourceSchema: Schema = {
				title: "output",
				type: "object",
				properties: {
					state: { type: "string", enum: ["on", "off"] },
				},
				additionalProperties: false,
				required: ["state"],
			};

			const result = syncEndNodeOutput(
				endNodeOutput,
				sourceNodeId,
				sourceOutputId,
				updatedSourceSchema,
			);

			// mapping is cleared because the source path disappeared
			expect(result?.output.mappings).toEqual([]);
			// end node's "status" resets to plain string (enum is not user-configurable)
			expect(result?.output.schema.properties).toEqual({
				status: { type: "string" },
			});
			// the removed mapping is reported
			expect(result?.removedMappings).toHaveLength(1);
		});

		it("resets array to plain string when clearing a stale mapping", () => {
			const sourceNodeId = NodeId.generate();
			const sourceOutputId = OutputId.generate();
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "output",
					type: "object",
					properties: {
						tags: { type: "array", items: { type: "string" } },
					},
					additionalProperties: false,
					required: ["tags"],
				},
				mappings: [
					{
						path: ["tags"],
						source: {
							nodeId: sourceNodeId,
							outputId: sourceOutputId,
							path: ["tags"],
						},
					},
				],
			};

			// source renames "tags" -> "labels", so mapped path ["tags"] no longer exists
			const updatedSourceSchema: Schema = {
				title: "output",
				type: "object",
				properties: {
					labels: { type: "array", items: { type: "string" } },
				},
				additionalProperties: false,
				required: ["labels"],
			};

			const result = syncEndNodeOutput(
				endNodeOutput,
				sourceNodeId,
				sourceOutputId,
				updatedSourceSchema,
			);

			// mapping is cleared because the source path disappeared
			expect(result?.output.mappings).toEqual([]);
			// end node's "tags" resets to plain string (array is not user-configurable)
			expect(result?.output.schema.properties).toEqual({
				tags: { type: "string" },
			});
			// the removed mapping is reported
			expect(result?.removedMappings).toHaveLength(1);
		});
	});
});
