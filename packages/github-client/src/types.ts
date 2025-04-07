export interface GitHubInstallationAppAuth {
	strategy: "github-installation";
	appId: string;
	privateKey: string;
	installationId: number;
}

export interface GitHubAppAuth {
	strategy: "github-app";
	appId: string;
	privateKey: string;
}

export interface GitHubAppUserAuth {
	strategy: "github-app-user";
	clientId: string;
	clientSecret: string;
	token: string;
	refreshToken: string;
}

export interface GitHubTokenAuth {
	strategy: "github-token";
	token: string;
}

export type GitHubAuthConfig =
	| GitHubInstallationAppAuth
	| GitHubAppAuth
	| GitHubAppUserAuth
	| GitHubTokenAuth;
