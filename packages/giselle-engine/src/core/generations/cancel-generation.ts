import {
	type CancelledGeneration,
	GenerationContext,
	type GenerationId,
} from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { getGeneration, setGeneration, setNodeGenerationIndex } from "./utils";

export async function cancelGeneration(args: {
	context: GiselleEngineContext;
	generationId: GenerationId;
}) {
	const generation = await getGeneration({
		storage: args.context.storage,
		generationId: args.generationId,
	});
	if (generation === undefined) {
		throw new Error(`Generation ${args.generationId} not found`);
	}
	const generationContext = GenerationContext.parse(generation.context);
	const cancelledGeneration: CancelledGeneration = {
		...generation,
		status: "cancelled",
		cancelledAt: Date.now(),
	};
	await Promise.all([
		setGeneration({
			storage: args.context.storage,
			generation: cancelledGeneration,
		}),
		setNodeGenerationIndex({
			storage: args.context.storage,
			nodeId: generationContext.operationNode.id,
			origin: generation.context.origin,
			nodeGenerationIndex: {
				id: generation.id,
				nodeId: generationContext.operationNode.id,
				status: "cancelled",
				createdAt: generation.createdAt,
				queuedAt: Date.now(),
				cancelledAt: Date.now(),
			},
		}),
	]);
	return cancelledGeneration;
}
