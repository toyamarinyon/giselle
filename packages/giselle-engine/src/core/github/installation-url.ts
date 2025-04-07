import { getInstallationUrl } from "@giselle-sdk/github-client";
import type { GiselleEngineContext } from "../types";

export async function installationUrl(args: {
	context: GiselleEngineContext;
	state?: string;
}) {
	const githubConfig = args.context.integrationConfigs?.find(
		(config) => config.provider === "github",
	);
	if (githubConfig === undefined) {
		throw new Error("GitHub configuration not found");
	}
	if (!(githubConfig.auth.strategy === "github-installation")) {
		throw new Error("GitHub installation strategy not found");
	}

	const installationUrl = await getInstallationUrl({
		strategy: "github-app",
		appId: githubConfig.auth.appId,
		privateKey: githubConfig.auth.privateKey,
	});
	const url = new URL(installationUrl);
	if (args.state === undefined) {
		return url;
	}
	url.searchParams.append("state", args.state);
	return url;
}
