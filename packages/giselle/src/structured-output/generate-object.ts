import { createGateway } from "@ai-sdk/gateway";
import { Schema } from "@giselles-ai/protocol";
import { generateText, Output } from "ai";

const GENERATE_OBJECT_MODEL = "openai/gpt-4.1-mini";
const MAX_PROMPT_LENGTH = 2000;
const GENERATE_OBJECT_SYSTEM_PROMPT = `Generate a JSON Schema from the user's description.
Property names must be in English.
Only use these types: string, number, boolean, object, array. Never use integer.
Every object MUST include "additionalProperties": false and a "required" array.`;

// Billed to Giselle, not the user — intentionally omits user-specific billing headers
export async function generateObject(input: { prompt: string }) {
	const prompt = input.prompt.trim();
	if (prompt.length === 0) {
		throw new Error("Prompt is required.");
	}
	if (prompt.length > MAX_PROMPT_LENGTH) {
		throw new Error(
			`Prompt is too long. Maximum length is ${MAX_PROMPT_LENGTH} characters.`,
		);
	}

	const gateway = createGateway({
		headers: {
			"http-referer":
				process.env.AI_GATEWAY_HTTP_REFERER ?? "https://giselles.ai",
			"x-title": process.env.AI_GATEWAY_X_TITLE ?? "Giselle",
		},
	});

	const { experimental_output } = await generateText({
		model: gateway(GENERATE_OBJECT_MODEL),
		experimental_output: Output.object({ schema: Schema }),
		system: GENERATE_OBJECT_SYSTEM_PROMPT,
		prompt,
	});
	return { schema: experimental_output };
}
