import { z } from "zod";

export const ManualTriggerProvider = z.object({
	type: z.literal("manual"),
	triggerId: z.string().describe("id of @giselle-sdk/flow/manualTrigger"),
});
export type ManualTriggerProvider = z.infer<typeof ManualTriggerProvider>;

const GitHubTriggerProviderAuthUnauthenticated = z.object({
	state: z.literal("unauthenticated"),
});
const GitHubTriggerProviderAuthAuthenticated = z.object({
	state: z.literal("authenticated"),
	installtionId: z.number(),
});
const GitHubTriggerProviderAuth = z.discriminatedUnion("state", [
	GitHubTriggerProviderAuthUnauthenticated,
	GitHubTriggerProviderAuthAuthenticated,
]);
export const GitHubTriggerProvider = z.object({
	type: z.literal("github"),
	triggerId: z.string().describe("id of @giselle-sdk/flow/githubTriggers"),
	auth: GitHubTriggerProviderAuth,
});
export type GitHubTriggerProvider = z.infer<typeof GitHubTriggerProvider>;

export const HttpTriggerProvider = z.object({
	type: z.literal("http"),
});
export type HttpTriggerProvider = z.infer<typeof HttpTriggerProvider>;

export const TriggerProvider = z.discriminatedUnion("type", [
	ManualTriggerProvider,
	GitHubTriggerProvider,
	HttpTriggerProvider,
]);
export type TriggerProvider = z.infer<typeof TriggerProvider>;

export const TriggerProviderLike = z.object({
	type: z.string(),
	triggerId: z.string().describe("id of @giselle-sdk/flow/trigger"),
});
export type TriggerProviderLike = z.infer<typeof TriggerProviderLike>;

export const TriggerContent = z.object({
	type: z.literal("trigger"),
	provider: TriggerProviderLike,
});
export type TriggerContent = z.infer<typeof TriggerContent>;

export const TriggerContentReference = z.object({
	type: TriggerContent.shape.type,
});
export type TriggerContentReference = z.infer<typeof TriggerContentReference>;
