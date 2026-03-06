"use server";

import type { Schema } from "@giselles-ai/protocol";
import { giselle } from "@/app/giselle";
import { structuredOutputFlag } from "@/flags";
import { getCurrentUser } from "@/lib/get-current-user";

export async function generateObject(input: { prompt: string }): Promise<{
	schema: Schema;
}> {
	const [, isEnabled] = await Promise.all([
		getCurrentUser(),
		structuredOutputFlag(),
	]);
	if (!isEnabled) {
		throw new Error("Structured output is disabled.");
	}

	return await giselle.generateObject(input);
}
