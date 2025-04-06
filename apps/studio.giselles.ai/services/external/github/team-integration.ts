import { db, teamGithubIntegrations } from "@/drizzle";
import { eq, and } from "drizzle-orm";
import type { TeamId } from "@/services/teams/types";
import { fetchCurrentTeam } from "@/services/teams/fetch-current-team";
import { gitHubAppInstallURL } from "./app";

/**
 * Gets all GitHub App installations for a team.
 * 
 * @param teamDbId - The database ID of the team
 * @returns Array of installation IDs
 */
export async function getTeamGitHubInstallations(teamDbId: number) {
  const installations = await db
    .select({ installationId: teamGithubIntegrations.installationId })
    .from(teamGithubIntegrations)
    .where(eq(teamGithubIntegrations.teamDbId, teamDbId));
  
  return installations.map(i => i.installationId);
}

/**
 * Adds a GitHub App installation to a team.
 * 
 * @param teamDbId - The database ID of the team
 * @param installationId - The GitHub App installation ID
 */
export async function addTeamGitHubInstallation(teamDbId: number, installationId: number) {
  await db.insert(teamGithubIntegrations)
    .values({
      teamDbId,
      installationId,
    })
    .onConflictDoNothing();
}

/**
 * Removes a GitHub App installation from a team.
 * 
 * @param teamDbId - The database ID of the team
 * @param installationId - The GitHub App installation ID
 */
export async function removeTeamGitHubInstallation(teamDbId: number, installationId: number) {
  await db.delete(teamGithubIntegrations)
    .where(
      and(
        eq(teamGithubIntegrations.teamDbId, teamDbId),
        eq(teamGithubIntegrations.installationId, installationId)
      )
    );
}

/**
 * Checks if a team has a specific GitHub App installation.
 * 
 * @param teamDbId - The database ID of the team
 * @param installationId - The GitHub App installation ID
 * @returns True if the team has the installation, false otherwise
 */
export async function hasTeamGitHubInstallation(teamDbId: number, installationId: number) {
  const installation = await db
    .select({ dbId: teamGithubIntegrations.dbId })
    .from(teamGithubIntegrations)
    .where(
      and(
        eq(teamGithubIntegrations.teamDbId, teamDbId),
        eq(teamGithubIntegrations.installationId, installationId)
      )
    )
    .limit(1);
  
  return installation.length > 0;
}

/**
 * Gets the GitHub App installation URL, ensuring the context of team-based installation
 * is maintained.
 * 
 * @returns The GitHub App installation URL
 */
export async function getTeamGitHubAppInstallURL() {
  // Use the existing function to get the base URL
  return gitHubAppInstallURL();
}

/**
 * Checks if the current user has access to a GitHub App installation
 * through their team membership.
 * 
 * @param installationId - The GitHub App installation ID
 * @returns True if the user has access, false otherwise
 */
export async function hasAccessToGitHubInstallation(installationId: number): Promise<boolean> {
  const team = await fetchCurrentTeam();
  if (!team) {
    return false;
  }
  
  return hasTeamGitHubInstallation(team.dbId, installationId);
}