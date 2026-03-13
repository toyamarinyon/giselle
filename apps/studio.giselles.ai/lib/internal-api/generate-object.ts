"use server";

import type { Schema } from "@giselles-ai/protocol";
import { giselle } from "@/app/giselle";
import { getCurrentUser } from "@/lib/get-current-user";

export async function generateObject(input: { prompt: string }): Promise<{
	schema: Schema;
}> {
	await getCurrentUser();

	return await giselle.generateObject(input);
}
