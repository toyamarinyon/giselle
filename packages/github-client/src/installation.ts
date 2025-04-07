import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/core";
import type { GitHubAppAuth, GitHubInstallationAppAuth } from "./types";

/**
 * Repository information from GitHub
 */
export interface Repository {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	html_url: string;
	private: boolean;
	description: string | null;
}

/**
 * Installation information with associated repositories
 */
export interface InstallationWithRepositories {
	id: number;
	account: {
		login?: string;
		name?: string;
		avatar_url?: string;
	};
	app_id: number;
	target_id: number;
	target_type: string;
	repositories: Repository[];
}

export async function getInstallation(auth: GitHubInstallationAppAuth) {
	const client = new Octokit({
		authStrategy: createAppAuth,
		auth,
	});

	// Get installation details
	const installationRes = await client.request(
		"GET /app/installations/{installation_id}",
		{
			installation_id: auth.installationId,
		},
	);

	// Get repositories for this installation
	const reposRes = await client.request("GET /installation/repositories", {
		per_page: 100,
	});

	/** @todo elminates type assertion */
	return {
		...installationRes.data,
		repositories: reposRes.data.repositories,
	} as InstallationWithRepositories;
}

export async function getInstallationUrl(auth: GitHubAppAuth) {
	const client = new Octokit({
		authStrategy: createAppAuth,
		auth,
	});
	const res = await client.request("GET /app");
	if (res.status !== 200 || !res.data) {
		throw new Error("Failed to get app information");
	}

	const url = new URL(
		`/apps/${res.data.slug}/installations/select_target`,
		"https://github.com",
	);
	return url.toString();
}
