import { type Generation, GenerationContext } from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import {
	setGenerationIndex,
	setGeneration as setGenerationInternal,
	setNodeGenerationIndex,
} from "./utils";

export async function setGeneration(args: {
	context: GiselleEngineContext;
	generation: Generation;
}) {
	const generationContext = GenerationContext.parse(args.generation.context);
	await Promise.all([
		setGenerationInternal({
			storage: args.context.storage,
			generation: args.generation,
		}),
		setGenerationIndex({
			storage: args.context.storage,
			generationIndex: {
				id: args.generation.id,
				origin: args.generation.context.origin,
			},
		}),
		setNodeGenerationIndex({
			storage: args.context.storage,
			nodeId: generationContext.operationNode.id,
			origin: args.generation.context.origin,
			nodeGenerationIndex: {
				id: args.generation.id,
				nodeId: generationContext.operationNode.id,
				status: args.generation.status,
				createdAt: args.generation.createdAt,
				queuedAt: args.generation.queuedAt,
				startedAt: args.generation.startedAt,
			},
		}),
	]);
}
