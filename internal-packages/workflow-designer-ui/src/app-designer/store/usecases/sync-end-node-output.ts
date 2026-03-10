import type {
	EndOutput,
	OutputId,
	PropertyMapping,
	Schema,
	SubSchema,
} from "@giselles-ai/protocol";

interface SyncResult {
	subSchema: SubSchema;
	mappings: PropertyMapping[];
}

function isEqualPath(a: string[], b: string[]): boolean {
	if (a.length !== b.length) return false;
	return a.every((segment, i) => segment === b[i]);
}

function findMappingAtSchemaPath(
	mappings: PropertyMapping[],
	schemaPath: string[],
): PropertyMapping | undefined {
	return mappings.find((mapping) => isEqualPath(mapping.path, schemaPath));
}

function navigateSchemaPath(
	schema: Schema,
	path: string[],
): SubSchema | undefined {
	let current: Schema | SubSchema = schema;
	for (const segment of path) {
		if (current.type === "object") {
			const next: SubSchema | undefined = current.properties[segment];
			if (next === undefined) {
				return undefined;
			}
			current = next;
		} else {
			return undefined;
		}
	}
	return current;
}

function resolveSubSchema(params: {
	mapping: PropertyMapping;
	subSchema: SubSchema;
	sourceNodeId: string;
	sourceOutputId: OutputId;
	sourceSchema: Schema;
	mappings: PropertyMapping[];
}): SyncResult {
	const {
		mapping,
		subSchema,
		sourceNodeId,
		sourceOutputId,
		sourceSchema,
		mappings,
	} = params;
	if (
		mapping.source.nodeId !== sourceNodeId ||
		mapping.source.outputId !== sourceOutputId
	) {
		return { subSchema, mappings };
	}

	// Whole object mapping: replace with the entire source schema
	if (mapping.source.path.length === 0) {
		return {
			subSchema: {
				type: "object",
				properties: sourceSchema.properties,
				required: sourceSchema.required,
				additionalProperties: sourceSchema.additionalProperties,
			},
			mappings,
		};
	}

	// Single property mapping: navigate to the referenced path in the source
	const sourceSubSchema = navigateSchemaPath(sourceSchema, mapping.source.path);
	if (sourceSubSchema === undefined) {
		// Source property no longer exists: remove the stale mapping
		return {
			subSchema,
			mappings: mappings.filter((m) => m !== mapping),
		};
	}

	// Source property found: replace with the updated schema
	return { subSchema: sourceSubSchema, mappings };
}

function syncSubSchema(params: {
	subSchema: SubSchema;
	schemaPath: string[];
	mappings: PropertyMapping[];
	sourceNodeId: string;
	sourceOutputId: OutputId;
	sourceSchema: Schema;
}): SyncResult {
	const {
		subSchema,
		schemaPath,
		mappings,
		sourceNodeId,
		sourceOutputId,
		sourceSchema,
	} = params;

	switch (subSchema.type) {
		case "string":
		case "number":
		case "boolean": {
			const mapping = findMappingAtSchemaPath(mappings, schemaPath);
			if (mapping === undefined) {
				return { subSchema, mappings };
			}

			return resolveSubSchema({
				mapping,
				subSchema,
				sourceNodeId,
				sourceOutputId,
				sourceSchema,
				mappings,
			});
		}
		case "object": {
			const mapping = findMappingAtSchemaPath(mappings, schemaPath);
			if (mapping) {
				return resolveSubSchema({
					mapping,
					subSchema,
					sourceNodeId,
					sourceOutputId,
					sourceSchema,
					mappings,
				});
			}

			const updatedProperties: Record<string, SubSchema> = {};
			let updatedMappings = mappings;
			let hasChanged = false;

			for (const [key, childSchema] of Object.entries(subSchema.properties)) {
				const syncedResult = syncSubSchema({
					subSchema: childSchema,
					schemaPath: [...schemaPath, key],
					mappings: updatedMappings,
					sourceNodeId,
					sourceOutputId,
					sourceSchema,
				});
				updatedProperties[key] = syncedResult.subSchema;

				if (syncedResult.subSchema !== childSchema) {
					hasChanged = true;
				}

				if (syncedResult.mappings !== updatedMappings) {
					hasChanged = true;
					updatedMappings = syncedResult.mappings;
				}
			}

			if (!hasChanged) {
				return { subSchema, mappings };
			}

			return {
				subSchema: { ...subSchema, properties: updatedProperties },
				mappings: updatedMappings,
			};
		}
		case "array": {
			const mapping = findMappingAtSchemaPath(mappings, schemaPath);
			if (mapping) {
				return resolveSubSchema({
					mapping,
					subSchema,
					sourceNodeId,
					sourceOutputId,
					sourceSchema,
					mappings,
				});
			}

			return { subSchema, mappings };
		}
		default: {
			const _exhaustive: never = subSchema;
			throw new Error(`Unhandled schema type: ${_exhaustive}`);
		}
	}
}

export interface SyncEndNodeOutputResult {
	output: Extract<EndOutput, { format: "object" }>;
	removedMappings: PropertyMapping[];
}

export function syncEndNodeOutput(
	endNodeOutput: Extract<EndOutput, { format: "object" }>,
	sourceNodeId: string,
	sourceOutputId: OutputId,
	sourceSchema: Schema,
): SyncEndNodeOutputResult | null {
	let hasChanged = false;
	let updatedMappings = endNodeOutput.mappings;
	const updatedProperties: Record<string, SubSchema> = {};

	for (const [key, subSchema] of Object.entries(
		endNodeOutput.schema.properties,
	)) {
		const syncedResult = syncSubSchema({
			subSchema,
			schemaPath: [key],
			mappings: updatedMappings,
			sourceNodeId,
			sourceOutputId,
			sourceSchema,
		});
		updatedProperties[key] = syncedResult.subSchema;

		if (syncedResult.subSchema !== subSchema) {
			hasChanged = true;
		}

		if (syncedResult.mappings !== updatedMappings) {
			hasChanged = true;
			updatedMappings = syncedResult.mappings;
		}
	}

	if (!hasChanged) {
		return null;
	}

	const removedMappings = endNodeOutput.mappings.filter(
		(m) => !updatedMappings.includes(m),
	);

	return {
		output: {
			format: "object",
			schema: { ...endNodeOutput.schema, properties: updatedProperties },
			mappings: updatedMappings,
		},
		removedMappings,
	};
}
