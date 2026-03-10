import {
	type CompletedGeneration,
	DataStoreId,
	type EndOutput,
	GenerationId,
	type GenerationOutput,
	NodeId,
	OutputId,
	WorkspaceId,
} from "@giselles-ai/protocol";
import { describe, expect, it } from "vitest";
import { buildObject } from "./build-object";

const defaultNodeId = NodeId.generate();
const defaultOutputId = OutputId.generate();

function createCompletedGeneration(params: {
	nodeId?: NodeId;
	outputs: GenerationOutput[];
}): CompletedGeneration {
	const now = Date.now();
	const outputDefinitions = params.outputs.map((output, index) => ({
		id: output.outputId,
		label: `output-${index + 1}`,
		accessor: `output-${index + 1}`,
	}));

	return {
		id: GenerationId.generate(),
		context: {
			operationNode: {
				id: params.nodeId ?? defaultNodeId,
				type: "operation",
				inputs: [],
				outputs: outputDefinitions,
				content: { type: "action" },
			},
			sourceNodes: [],
			connections: [],
			origin: {
				type: "studio",
				workspaceId: WorkspaceId.generate(),
			},
		},
		status: "completed",
		createdAt: now,
		queuedAt: now + 1,
		startedAt: now + 2,
		completedAt: now + 3,
		messages: [],
		outputs: params.outputs,
	};
}

describe("buildObject", () => {
	describe("valid", () => {
		it("maps a single flat string property", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						summary: { type: "string" },
					},
					additionalProperties: false,
					required: ["summary"],
				},
				mappings: [
					{
						path: ["summary"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: [],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: "hello world",
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({
				summary: "hello world",
			});
		});

		it("maps multiple properties from different generation output types", () => {
			const summaryNodeId = NodeId.generate();
			const queryNodeId = NodeId.generate();
			const dataQueryNodeId = NodeId.generate();
			const summaryOutputId = OutputId.generate();
			const queryOutputId = OutputId.generate();
			const dataQueryOutputId = OutputId.generate();

			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						summary: { type: "string" },
						queryContext: { type: "string" },
						rowsText: { type: "string" },
					},
					additionalProperties: false,
					required: ["summary", "queryContext", "rowsText"],
				},
				mappings: [
					{
						path: ["summary"],
						source: {
							nodeId: summaryNodeId,
							outputId: summaryOutputId,
							path: [],
						},
					},
					{
						path: ["queryContext"],
						source: {
							nodeId: queryNodeId,
							outputId: queryOutputId,
							path: [],
						},
					},
					{
						path: ["rowsText"],
						source: {
							nodeId: dataQueryNodeId,
							outputId: dataQueryOutputId,
							path: [],
						},
					},
				],
			};

			const generationsByNodeId = {
				[summaryNodeId]: createCompletedGeneration({
					nodeId: summaryNodeId,
					outputs: [
						{
							type: "generated-text",
							outputId: summaryOutputId,
							content: "summary text",
						},
					],
				}),
				[queryNodeId]: createCompletedGeneration({
					nodeId: queryNodeId,
					outputs: [
						{
							type: "query-result",
							outputId: queryOutputId,
							content: [],
						},
					],
				}),
				[dataQueryNodeId]: createCompletedGeneration({
					nodeId: dataQueryNodeId,
					outputs: [
						{
							type: "data-query-result",
							outputId: dataQueryOutputId,
							content: {
								type: "data-query",
								dataStoreId: DataStoreId.generate(),
								rows: [{ id: 1, name: "Alice" }],
								rowCount: 1,
								query: "SELECT id, name FROM users",
							},
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({
				summary: "summary text",
				rowsText: JSON.stringify([{ id: 1, name: "Alice" }], null, 2),
			});
		});

		it("maps nested object properties using source.path", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						user: {
							type: "object",
							properties: {
								name: { type: "string" },
							},
							required: ["name"],
							additionalProperties: false,
						},
					},
					additionalProperties: false,
					required: ["user"],
				},
				mappings: [
					{
						path: ["user", "name"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: ["name"],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: JSON.stringify({ name: "Alice" }),
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({
				user: {
					name: "Alice",
				},
			});
		});

		it("maps array directly when mapping path matches array schema path", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						tags: {
							type: "array",
							items: { type: "string" },
						},
					},
					additionalProperties: false,
					required: ["tags"],
				},
				mappings: [
					{
						path: ["tags"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: [],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: JSON.stringify(["a", "b", "c"]),
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({
				tags: ["a", "b", "c"],
			});
		});

		it("parses whole object when source.path is empty and target schema is object", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						response: {
							type: "object",
							properties: {
								name: { type: "string" },
							},
							required: ["name"],
							additionalProperties: false,
						},
					},
					additionalProperties: false,
					required: ["response"],
				},
				mappings: [
					{
						path: ["response"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: [],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: JSON.stringify({ name: "Bob" }),
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({
				response: {
					name: "Bob",
				},
			});
		});

		it("coerces number and boolean values extracted through source.path", () => {
			const nodeId = NodeId.generate();
			const numberOutputId = OutputId.generate();
			const booleanOutputId = OutputId.generate();

			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						count: { type: "number" },
						isActive: { type: "boolean" },
					},
					additionalProperties: false,
					required: ["count", "isActive"],
				},
				mappings: [
					{
						path: ["count"],
						source: {
							nodeId,
							outputId: numberOutputId,
							path: ["count"],
						},
					},
					{
						path: ["isActive"],
						source: {
							nodeId,
							outputId: booleanOutputId,
							path: ["isActive"],
						},
					},
				],
			};

			const generationsByNodeId = {
				[nodeId]: createCompletedGeneration({
					nodeId,
					outputs: [
						{
							type: "generated-text",
							outputId: numberOutputId,
							content: JSON.stringify({ count: "42" }),
						},
						{
							type: "generated-text",
							outputId: booleanOutputId,
							content: JSON.stringify({ isActive: "true" }),
						},
					],
				}),
			};

			const result = buildObject(endNodeOutput, generationsByNodeId);
			expect(result).toEqual({ count: 42, isActive: true });
			expect(typeof result.count).toBe("number");
			expect(typeof result.isActive).toBe("boolean");
		});

		it("maps a string property with enum constraint", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						color: { type: "string", enum: ["red", "green", "blue"] },
					},
					additionalProperties: false,
					required: ["color"],
				},
				mappings: [
					{
						path: ["color"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: [],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: "green",
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({
				color: "green",
			});
		});

		it("maps a string enum property extracted through source.path", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
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
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: ["status"],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: JSON.stringify({ status: "active" }),
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({
				status: "active",
			});
		});

		it("coerces string-to-number, string-to-boolean, and number-to-string values", () => {
			const numberNodeId = NodeId.generate();
			const booleanNodeId = NodeId.generate();
			const stringNodeId = NodeId.generate();
			const numberOutputId = OutputId.generate();
			const booleanOutputId = OutputId.generate();
			const stringOutputId = OutputId.generate();

			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						count: { type: "number" },
						isActive: { type: "boolean" },
						productId: { type: "string" },
					},
					additionalProperties: false,
					required: ["count", "isActive", "productId"],
				},
				mappings: [
					{
						path: ["count"],
						source: {
							nodeId: numberNodeId,
							outputId: numberOutputId,
							path: [],
						},
					},
					{
						path: ["isActive"],
						source: {
							nodeId: booleanNodeId,
							outputId: booleanOutputId,
							path: [],
						},
					},
					{
						path: ["productId"],
						source: {
							nodeId: stringNodeId,
							outputId: stringOutputId,
							path: ["productId"],
						},
					},
				],
			};
			const generationsByNodeId = {
				[numberNodeId]: createCompletedGeneration({
					nodeId: numberNodeId,
					outputs: [
						{
							type: "generated-text",
							outputId: numberOutputId,
							content: "42",
						},
					],
				}),
				[booleanNodeId]: createCompletedGeneration({
					nodeId: booleanNodeId,
					outputs: [
						{
							type: "generated-text",
							outputId: booleanOutputId,
							content: "true",
						},
					],
				}),
				[stringNodeId]: createCompletedGeneration({
					nodeId: stringNodeId,
					outputs: [
						{
							type: "generated-text",
							outputId: stringOutputId,
							content: JSON.stringify({ productId: 12345 }),
						},
					],
				}),
			};

			const result = buildObject(endNodeOutput, generationsByNodeId);
			expect(result).toEqual({
				count: 42,
				isActive: true,
				productId: "12345",
			});
			expect(typeof result.count).toBe("number");
			expect(typeof result.isActive).toBe("boolean");
			expect(typeof result.productId).toBe("string");
		});

		it("recursively coerces array of objects in whole-array mapping", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						users: {
							type: "array",
							items: {
								type: "object",
								properties: {
									name: { type: "string" },
									score: { type: "number" },
									active: { type: "boolean" },
								},
								required: ["name", "score", "active"],
								additionalProperties: false,
							},
						},
					},
					additionalProperties: false,
					required: ["users"],
				},
				mappings: [
					{
						path: ["users"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: [],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: JSON.stringify([
								{ name: "Alice", score: "95", active: "true" },
								{ name: "Bob", score: "87", active: "false" },
							]),
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({
				users: [
					{ name: "Alice", score: 95, active: true },
					{ name: "Bob", score: 87, active: false },
				],
			});
		});
	});

	describe("invalid", () => {
		describe("dangerous keys", () => {
			it("skips __proto__ schema property to prevent prototype pollution", () => {
				const protoOutputId = OutputId.generate();
				const nameOutputId = OutputId.generate();

				const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
					format: "object",
					schema: {
						title: "TestSchema",
						type: "object",
						properties: {
							["__proto__"]: {
								type: "object",
								properties: {
									polluted: { type: "boolean" },
								},
								required: ["polluted"],
								additionalProperties: false,
							},
							name: { type: "string" },
						},
						additionalProperties: false,
						required: ["__proto__", "name"],
					},
					mappings: [
						{
							path: ["__proto__"],
							source: {
								nodeId: defaultNodeId,
								outputId: protoOutputId,
								path: [],
							},
						},
						{
							path: ["name"],
							source: {
								nodeId: defaultNodeId,
								outputId: nameOutputId,
								path: [],
							},
						},
					],
				};
				const generationsByNodeId = {
					[defaultNodeId]: createCompletedGeneration({
						outputs: [
							{
								type: "generated-text",
								outputId: protoOutputId,
								content: JSON.stringify({ polluted: true }),
							},
							{
								type: "generated-text",
								outputId: nameOutputId,
								content: "hello",
							},
						],
					}),
				};

				const result = buildObject(endNodeOutput, generationsByNodeId);

				expect(result).toEqual({ name: "hello" });
				expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
			});

			it("allows constructor and prototype as schema properties", () => {
				const constructorOutputId = OutputId.generate();
				const prototypeOutputId = OutputId.generate();
				const safeOutputId = OutputId.generate();

				const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
					format: "object",
					schema: {
						title: "TestSchema",
						type: "object",
						properties: {
							constructor: { type: "string" } as const,
							prototype: { type: "string" } as const,
							safe: { type: "string" },
						},
						additionalProperties: false,
						required: ["constructor", "prototype", "safe"],
					},
					mappings: [
						{
							path: ["constructor"],
							source: {
								nodeId: defaultNodeId,
								outputId: constructorOutputId,
								path: [],
							},
						},
						{
							path: ["prototype"],
							source: {
								nodeId: defaultNodeId,
								outputId: prototypeOutputId,
								path: [],
							},
						},
						{
							path: ["safe"],
							source: {
								nodeId: defaultNodeId,
								outputId: safeOutputId,
								path: [],
							},
						},
					],
				};
				const generationsByNodeId = {
					[defaultNodeId]: createCompletedGeneration({
						outputs: [
							{
								type: "generated-text",
								outputId: constructorOutputId,
								content: "ctor",
							},
							{
								type: "generated-text",
								outputId: prototypeOutputId,
								content: "proto",
							},
							{
								type: "generated-text",
								outputId: safeOutputId,
								content: "ok",
							},
						],
					}),
				};

				const result = buildObject(endNodeOutput, generationsByNodeId);

				expect(result).toEqual({
					constructor: "ctor",
					prototype: "proto",
					safe: "ok",
				});
			});

			it("skips __proto__ in nested object properties via coerceToSubSchema", () => {
				const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
					format: "object",
					schema: {
						title: "TestSchema",
						type: "object",
						properties: {
							data: {
								type: "object",
								properties: {
									["__proto__"]: {
										type: "object",
										properties: {
											polluted: { type: "boolean" },
										},
										required: ["polluted"],
										additionalProperties: false,
									},
									name: { type: "string" },
								},
								required: ["__proto__", "name"],
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
								nodeId: defaultNodeId,
								outputId: defaultOutputId,
								path: [],
							},
						},
					],
				};
				const generationsByNodeId = {
					[defaultNodeId]: createCompletedGeneration({
						outputs: [
							{
								type: "generated-text",
								outputId: defaultOutputId,
								content: JSON.stringify({
									["__proto__"]: { polluted: true },
									name: "Alice",
								}),
							},
						],
					}),
				};

				const result = buildObject(endNodeOutput, generationsByNodeId);

				expect(result).toEqual({ data: { name: "Alice" } });
				expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
				expect(
					Object.getPrototypeOf(result.data as Record<string, unknown>),
				).toBe(Object.prototype);
			});
		});

		it("returns empty object when generation is missing for mapped nodeId", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						summary: { type: "string" },
					},
					additionalProperties: false,
					required: ["summary"],
				},
				mappings: [
					{
						path: ["summary"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: [],
						},
					},
				],
			};

			expect(buildObject(endNodeOutput, {})).toEqual({});
		});

		it("returns empty object when mapped outputId does not exist", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						summary: { type: "string" },
					},
					additionalProperties: false,
					required: ["summary"],
				},
				mappings: [
					{
						path: ["summary"],
						source: {
							nodeId: defaultNodeId,
							outputId: OutputId.generate(),
							path: [],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: OutputId.generate(),
							content: "hello",
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({});
		});

		it("returns empty object when source.path navigates into an array value", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						name: { type: "string" },
					},
					additionalProperties: false,
					required: ["name"],
				},
				mappings: [
					{
						path: ["name"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: ["items", "name"],
						},
					},
				],
			};
			// source.path = ["items", "name"] specifies "name", but the value at
			// "items" is an array with multiple elements, so there is no way to
			// determine which element's "name" to pick.
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: JSON.stringify({
								items: [{ name: "Alice" }, { name: "Bob" }],
							}),
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({});
		});

		it("omits nested object when no child properties can be resolved", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						user: {
							type: "object",
							properties: {
								name: { type: "string" },
								age: { type: "number" },
							},
							required: ["name", "age"],
							additionalProperties: false,
						},
					},
					additionalProperties: false,
					required: ["user"],
				},
				mappings: [
					{
						path: ["user", "name"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: [],
						},
					},
					{
						path: ["user", "age"],
						source: {
							nodeId: defaultNodeId,
							outputId: OutputId.generate(),
							path: [],
						},
					},
				],
			};

			expect(buildObject(endNodeOutput, {})).toEqual({});
		});

		it("rejects whole-object mapping when nested property types do not match schema", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						user: {
							type: "object",
							properties: {
								name: { type: "string" },
								age: { type: "number" },
							},
							required: ["name", "age"],
							additionalProperties: false,
						},
					},
					additionalProperties: false,
					required: ["user"],
				},
				mappings: [
					{
						path: ["user"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: [],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: JSON.stringify({ name: true, age: "not-a-number" }),
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({});
		});

		it("coerces whole-object mapping and keeps only schema-conforming properties", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						user: {
							type: "object",
							properties: {
								name: { type: "string" },
								age: { type: "number" },
							},
							required: ["name", "age"],
							additionalProperties: false,
						},
					},
					additionalProperties: false,
					required: ["user"],
				},
				mappings: [
					{
						path: ["user"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: [],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: JSON.stringify({
								name: "Alice",
								age: "not-a-number",
								extra: "ignored",
							}),
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({
				user: { name: "Alice" },
			});
		});

		it("rejects whole-array mapping when item types do not match schema", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						tags: {
							type: "array",
							items: { type: "string" },
						},
					},
					additionalProperties: false,
					required: ["tags"],
				},
				mappings: [
					{
						path: ["tags"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: [],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: JSON.stringify([true, false, true]),
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({});
		});

		it("rejects whole-array mapping when some items do not match schema", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						tags: {
							type: "array",
							items: { type: "string" },
						},
					},
					additionalProperties: false,
					required: ["tags"],
				},
				mappings: [
					{
						path: ["tags"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: [],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: JSON.stringify(["valid", true, "also-valid"]),
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({});
		});

		it("omits object field when raw text parses to a primitive", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						response: {
							type: "object",
							properties: {
								name: { type: "string" },
							},
							required: ["name"],
							additionalProperties: false,
						},
					},
					additionalProperties: false,
					required: ["response"],
				},
				mappings: [
					{
						path: ["response"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: [],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: "42",
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({});
		});

		it("omits array field when raw text parses to an object", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						tags: {
							type: "array",
							items: { type: "string" },
						},
					},
					additionalProperties: false,
					required: ["tags"],
				},
				mappings: [
					{
						path: ["tags"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: [],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: JSON.stringify({ a: 1 }),
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({});
		});

		it("omits fields when raw text cannot be coerced to the target schema type", () => {
			const numberNodeId = NodeId.generate();
			const booleanNodeId = NodeId.generate();
			const stringNodeId = NodeId.generate();
			const numberOutputId = OutputId.generate();
			const booleanOutputId = OutputId.generate();
			const stringOutputId = OutputId.generate();

			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						count: { type: "number" },
						isActive: { type: "boolean" },
						name: { type: "string" },
					},
					additionalProperties: false,
					required: ["count", "isActive", "name"],
				},
				mappings: [
					{
						path: ["count"],
						source: {
							nodeId: numberNodeId,
							outputId: numberOutputId,
							path: [],
						},
					},
					{
						path: ["isActive"],
						source: {
							nodeId: booleanNodeId,
							outputId: booleanOutputId,
							path: [],
						},
					},
					{
						path: ["name"],
						source: {
							nodeId: stringNodeId,
							outputId: stringOutputId,
							path: ["name"],
						},
					},
				],
			};
			const generationsByNodeId = {
				[numberNodeId]: createCompletedGeneration({
					nodeId: numberNodeId,
					outputs: [
						{
							type: "generated-text",
							outputId: numberOutputId,
							content: "not-a-number",
						},
					],
				}),
				[booleanNodeId]: createCompletedGeneration({
					nodeId: booleanNodeId,
					outputs: [
						{
							type: "generated-text",
							outputId: booleanOutputId,
							content: "yes",
						},
					],
				}),
				[stringNodeId]: createCompletedGeneration({
					nodeId: stringNodeId,
					outputs: [
						{
							type: "generated-text",
							outputId: stringOutputId,
							content: JSON.stringify({ name: true }),
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({});
		});

		it("returns empty object when source.path points to a missing property", () => {
			const endNodeOutput: Extract<EndOutput, { format: "object" }> = {
				format: "object",
				schema: {
					title: "TestSchema",
					type: "object",
					properties: {
						summary: { type: "string" },
					},
					additionalProperties: false,
					required: ["summary"],
				},
				mappings: [
					{
						path: ["summary"],
						source: {
							nodeId: defaultNodeId,
							outputId: defaultOutputId,
							path: ["missing"],
						},
					},
				],
			};
			const generationsByNodeId = {
				[defaultNodeId]: createCompletedGeneration({
					outputs: [
						{
							type: "generated-text",
							outputId: defaultOutputId,
							content: JSON.stringify({ existing: "value" }),
						},
					],
				}),
			};

			expect(buildObject(endNodeOutput, generationsByNodeId)).toEqual({});
		});
	});
});
