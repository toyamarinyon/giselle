import { Logger } from "@/lib/logger";
import { fetchCurrentTeam } from "@/services/teams/fetch-current-team";
import { addTeamGitHubInstallation, removeTeamGitHubInstallation } from "@/services/external/github";
import { fetchCurrentUser } from "@/services/accounts/fetch-current-user";
import { db, teams, teamMemberships, users } from "@/drizzle";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const logger = new Logger({ context: "github-webhook" });

/**
 * Handles GitHub webhook events, primarily focusing on installation events
 * to maintain team-based GitHub integrations.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const signature = request.headers.get("x-hub-signature-256");
  const event = request.headers.get("x-github-event");
  
  // Validate the webhook signature
  if (!isValidSignature(await request.clone().text(), signature)) {
    logger.error("Invalid GitHub webhook signature");
    return new Response("Unauthorized", { status: 401 });
  }
  
  logger.info(`Received GitHub webhook: ${event}`);
  
  try {
    // Handle installation events
    if (event === "installation") {
      const installationId = body.installation.id;
      
      // Check if this is a new installation or a deletion
      if (body.action === "created") {
        await handleInstallationCreated(installationId, body);
      } else if (body.action === "deleted") {
        await handleInstallationDeleted(installationId);
      }
    }
    
    // Handle installation_repositories events
    if (event === "installation_repositories") {
      // Repository changes within an existing installation
      // Usually no action needed here for team-based installations
      logger.info(`Repository list updated for installation ${body.installation.id}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error processing GitHub webhook", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handles a new GitHub App installation.
 */
async function handleInstallationCreated(installationId: number, payload: any) {
  // Get the GitHub user who installed the app
  const githubUsername = payload.sender.login;
  logger.info(`New GitHub installation ${installationId} by ${githubUsername}`);
  
  // Find all teams where this user is an admin
  // This is needed because the installation happens outside our app context
  const teamsQuery = await db
    .select({ 
      teamDbId: teams.dbId,
      teamName: teams.name
    })
    .from(teamMemberships)
    .innerJoin(users, eq(teamMemberships.userDbId, users.dbId))
    .innerJoin(teams, eq(teamMemberships.teamDbId, teams.dbId))
    .where(
      and(
        eq(teamMemberships.role, "admin")
        // Ideally we would match the GitHub username here
        // but we may not have that info stored
        // This will be improved in a future update
      )
    );
  
  if (teamsQuery.length === 0) {
    logger.warn(`No matching teams found for GitHub installation ${installationId}`);
    // Consider storing pending installations somewhere until we can match them
    return;
  }
  
  // For now, we'll link to the first team found
  // Future improvement: create a UI for user to select which team to link
  const teamDbId = teamsQuery[0].teamDbId;
  const teamName = teamsQuery[0].teamName;
  
  // Save the installation to the team
  await addTeamGitHubInstallation(teamDbId, installationId);
  logger.info(`Linked GitHub installation ${installationId} to team ${teamName} (${teamDbId})`);
}

/**
 * Handles a GitHub App uninstallation.
 */
async function handleInstallationDeleted(installationId: number) {
  logger.info(`GitHub installation ${installationId} was deleted`);
  
  // Find all teams with this installation
  const teamsQuery = await db
    .select({ 
      teamDbId: teams.dbId,
      teamName: teams.name
    })
    .from(teams)
    .innerJoin(
      "team_github_integrations", 
      eq(teams.dbId, "team_github_integrations.team_db_id")
    )
    .where(eq("team_github_integrations.installation_id", installationId));
  
  // Remove the installation from all teams
  for (const team of teamsQuery) {
    await removeTeamGitHubInstallation(team.teamDbId, installationId);
    logger.info(`Removed GitHub installation ${installationId} from team ${team.teamName} (${team.teamDbId})`);
  }
}

/**
 * Validates the webhook signature against the request body.
 */
function isValidSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false;
  if (!process.env.GITHUB_WEBHOOK_SECRET) {
    logger.warn("GITHUB_WEBHOOK_SECRET is not configured");
    return true; // For development, consider it valid if no secret is set
  }
  
  const hmac = crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}