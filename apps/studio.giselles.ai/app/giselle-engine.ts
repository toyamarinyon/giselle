import { waitForLangfuseFlush } from "@/instrumentation.node";
import { fetchUsageLimits } from "@/packages/lib/fetch-usage-limits";
import { onConsumeAgentTime } from "@/packages/lib/on-consume-agent-time";
import supabaseStorageDriver from "@/supabase-storage-driver";
import { WorkspaceId } from "@giselle-sdk/data-type";
import { NextGiselleEngine } from "@giselle-sdk/giselle-engine/next";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";

const isVercelEnvironment = process.env.VERCEL === "1";

const storage = createStorage({
	driver: isVercelEnvironment
		? supabaseStorageDriver({
				supabaseUrl: process.env.SUPABASE_URL ?? "",
				supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",
				bucket: "app",
			})
		: fsDriver({
				base: "./.storage",
			}),
});

const sampleAppWorkspaceId = WorkspaceId.parse(
	process.env.SAMPLE_APP_WORKSPACE_ID,
);

const githubAppId = process.env.GITHUB_APP_ID;
const githubAppPrivateKey = process.env.GITHUB_APP_PRIVATE_KEY;

if (githubAppId === undefined || githubAppPrivateKey === undefined) {
	throw new Error("Missing environment variables");
}

export const giselleEngine = NextGiselleEngine({
	basePath: "/api/giselle",
	storage,
	llmProviders: ["openai", "anthropic", "google", "perplexity", "fal"],
	onConsumeAgentTime,
	telemetry: {
		isEnabled: true,
		waitForFlushFn: waitForLangfuseFlush,
	},
	fetchUsageLimitsFn: fetchUsageLimits,
	sampleAppWorkspaceId,
	integrationConfigs: [
		{
			provider: "github",
			auth: {
				strategy: "github-installation",
				appId: githubAppId,
				privateKey: githubAppPrivateKey,
			},
		},
	],
});
