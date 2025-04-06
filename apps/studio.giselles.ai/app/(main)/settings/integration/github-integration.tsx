import { Button } from "@/components/ui/button";
import { db, teamGithubIntegrations, teams } from "@/drizzle";
import { getGitHubIdentityState } from "@/services/accounts";
import { 
	buildAppInstallationClient,
	getTeamGitHubAppInstallURL, 
	getTeamGitHubInstallations 
} from "@/services/external/github";
import { fetchCurrentTeam } from "@/services/teams/fetch-current-team";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, SiGithub } from "@icons-pack/react-simple-icons";
import type { components } from "@octokit/openapi-types";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { GitHubAppInstallButton } from "../../../../packages/components/github-app-install-button";

export async function GitHubIntegration() {
	// Get current team
	const team = await fetchCurrentTeam();
	if (!team) {
		return (
			<div className="space-y-4">
				<Alert variant="warning">
					<InfoIcon className="h-4 w-4" />
					<AlertTitle>Team required</AlertTitle>
					<AlertDescription>
						You need to be part of a team to use GitHub integrations.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Get installation URL (team-based)
	const installUrl = await getTeamGitHubAppInstallURL();
	
	// Get team's GitHub installations
	const installationIds = await getTeamGitHubInstallations(team.dbId);
	
	// If no installations, show the basic UI
	if (installationIds.length === 0) {
		return (
			<GitHubIntegrationPresentation 
				teamName={team.name}
				installationUrl={installUrl} 
			/>
		);
	}
	
	// Get repositories for each installation
	const installationsWithRepos = await Promise.all(
		installationIds.map(async (installationId) => {
			try {
				const installationClient = await buildAppInstallationClient(installationId);
				
				// Get installation details
				const { data: installation } = await installationClient.request(
					"GET /app/installations/{installation_id}",
					{ installation_id: installationId }
				);
				
				// Get repositories for this installation
				const { data: repos } = await installationClient.request(
					"GET /installation/repositories",
					{ per_page: 100 }
				);
				
				return {
					...installation,
					repositories: repos.repositories || [],
				};
			} catch (error) {
				console.error(`Error fetching data for installation ${installationId}:`, error);
				return null;
			}
		})
	);
	
	// Filter out any failed installations
	const validInstallations = installationsWithRepos.filter(Boolean);

	return (
		<GitHubIntegrationPresentation
			teamName={team.name}
			installations={validInstallations}
			installationUrl={installUrl}
		/>
	);
}

type Repository = components["schemas"]["repository"];
type Installation = components["schemas"]["installation"];
type InstallationWithRepositories = Installation & {
	repositories: Repository[];
};

type GitHubIntegrationPresentationProps = {
	teamName: string;
	installations?: InstallationWithRepositories[];
	installationUrl?: string;
};

function GitHubIntegrationPresentation({
	teamName,
	installations,
	installationUrl,
}: GitHubIntegrationPresentationProps) {
	const installed = installations != null && installations?.length > 0;
	return (
		<div className="space-y-8 text-black-30">
			<Header
				teamName={teamName}
				installed={installed}
				installationUrl={installationUrl}
			/>
			
			{/* Team-based installation notice */}
			<Alert>
				<InfoIcon className="h-4 w-4" />
				<AlertTitle>Team-based GitHub integration</AlertTitle>
				<AlertDescription>
					GitHub App installations are managed at the team level. All members of team "{teamName}" 
					will have access to the repositories available through these installations.
				</AlertDescription>
			</Alert>
			
			{installed && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{installations.map((installation) => (
						<Installation key={installation.id} installation={installation} />
					))}
				</div>
			)}
		</div>
	);
}

type HeaderProps = {
	teamName: string;
	installed: boolean;
	installationUrl?: string;
};

function Header({ teamName, installed, installationUrl }: HeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center space-x-3">
				<SiGithub className="w-8 h-8" />
				<div>
					<h2 className="text-lg">GitHub</h2>
					<div className="text-sm text-muted-foreground">
						Team: <span className="text-blue-500">{teamName}</span>
					</div>
				</div>
			</div>
			<div>
				{installationUrl ? (
					<GitHubAppInstallButton
						installationUrl={installationUrl}
						installed={installed}
					/>
				) : (
					<Button disabled>
						Unable to load installation URL
					</Button>
				)}
			</div>
		</div>
	);
}

type InstallationProps = {
	installation: InstallationWithRepositories;
};

function Installation({ installation }: InstallationProps) {
	const account = installation.account;
	if (!account) {
		return null;
	}

	const displayName = "login" in account ? account.login : account.name || "";
	const avatarUrl = "avatar_url" in account ? account.avatar_url : undefined;

	return (
		<div className="overflow-hidden rounded-lg border border-black-70">
			<div className="flex items-center space-x-3 border-b border-black-70 p-3 bg-black-70">
				{avatarUrl && (
					<img
						src={avatarUrl}
						alt={displayName}
						className="w-6 h-6 rounded-full"
					/>
				)}
				<span>{displayName}</span>
			</div>
			<div className="p-4 space-y-3">
				{installation.repositories.map((repo) => (
					<div key={repo.id} className="flex items-center">
						<a
							href={repo.html_url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm hover:underline"
						>
							{repo.name}
						</a>
						<span className="ml-2 rounded-full px-2 py-0.5 text-xs border border-black-30">
							{repo.private ? "Private" : "Public"}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}