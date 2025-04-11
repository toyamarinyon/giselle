import { z } from "zod";
import { Capability, LanguageModelBase, Tier } from "./base";

const AnthropicLanguageModelConfigurations = z.object({
	temperature: z.number(),
	topP: z.number(),
	reasoning: z.boolean().default(false),
});
type AnthropicLanguageModelConfigurations = z.infer<
	typeof AnthropicLanguageModelConfigurations
>;

const defaultConfigurations: AnthropicLanguageModelConfigurations = {
	temperature: 0.7,
	topP: 1.0,
	reasoning: false,
};

const AnthropicLanguageModel = LanguageModelBase.extend({
	provider: z.literal("anthropic"),
	configurations: AnthropicLanguageModelConfigurations,
});
type AnthropicLanguageModel = z.infer<typeof AnthropicLanguageModel>;

const claude37Sonnet: AnthropicLanguageModel = {
	provider: "anthropic",
	id: "claude-3-7-sonnet-20250219",
	capabilities:
		Capability.TextGeneration |
		Capability.PdfFileInput |
		Capability.Reasoning |
		Capability.ImageFileInput,
	tier: Tier.enum.pro,
	configurations: defaultConfigurations,
};
const claude35Sonnet: AnthropicLanguageModel = {
	provider: "anthropic",
	id: "claude-3-5-sonnet-20241022",
	capabilities:
		Capability.TextGeneration |
		Capability.PdfFileInput |
		Capability.ImageFileInput,
	tier: Tier.enum.pro,
	configurations: defaultConfigurations,
};
const claude35Haiku: AnthropicLanguageModel = {
	provider: "anthropic",
	id: "claude-3-5-haiku-20241022",
	capabilities:
		Capability.TextGeneration |
		Capability.PdfFileInput |
		Capability.ImageFileInput,
	tier: Tier.enum.free,
	configurations: defaultConfigurations,
};

export const models = [claude37Sonnet, claude35Sonnet, claude35Haiku];

export const LanguageModel = AnthropicLanguageModel;
export type LanguageModel = AnthropicLanguageModel;
