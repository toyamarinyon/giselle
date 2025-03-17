import { z } from "zod";
import {
	LanguageModel as AnthropicLanguageModel,
	models as anthropicLanguageModels,
} from "./anthropic";
import {
	LanguageModel as FalLanguageModel,
	models as falLanguageModels,
} from "./fal";
import {
	LanguageModel as GoogleLanguageModel,
	models as googleLanguageModels,
} from "./google";
import {
	LanguageModel as OpenAILanguageModel,
	models as openaiLanguageModels,
} from "./openai";
export * from "./base";
export * from "./helper";

export const LanguageModel = z.discriminatedUnion("provider", [
	AnthropicLanguageModel,
	GoogleLanguageModel,
	OpenAILanguageModel,
	FalLanguageModel,
]);
export type LanguageModel = z.infer<typeof LanguageModel>;

export const languageModels = [
	...googleLanguageModels,
	...anthropicLanguageModels,
	...openaiLanguageModels,
	...falLanguageModels,
];

export {
	AnthropicLanguageModel,
	GoogleLanguageModel,
	OpenAILanguageModel,
	FalLanguageModel,
	anthropicLanguageModels,
	openaiLanguageModels,
	googleLanguageModels,
	falLanguageModels,
};

export const LanguageModelProviders = z.enum([
	AnthropicLanguageModel.shape.provider.value,
	GoogleLanguageModel.shape.provider.value,
	OpenAILanguageModel.shape.provider.value,
	FalLanguageModel.shape.provider.value,
]);
export type LanguageModelProvider = z.infer<typeof LanguageModelProviders>;
