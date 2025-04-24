import { z } from "zod";
import type { ActionBase } from "../base";

const provider = "github" as const;

export interface GitHubAction extends ActionBase {
	provider: typeof provider;
}

export const githubCreateIssueAction = {
	provider,
	id: "github.create.issue",
	label: "Create an Issue",
	description: "Create a new issue on GitHub",
	parameters: z.object({
		owner: z.string().describe("Repository owner"),
		repo: z.string().describe("Repository name"),
		title: z.string().describe("Issue title"),
		body: z.string().describe("Issue body content").optional(),
		assignees: z
			.array(z.string())
			.describe("Usernames to assign to this issue")
			.optional(),
		labels: z
			.array(z.string())
			.describe("Labels to apply to this issue")
			.optional(),
		milestone: z.number().describe("Milestone number").optional(),
	}),
} as const satisfies GitHubAction;

export const githubCreateIssueCommentAction = {
	provider,
	id: "github.create.issuecomment",
	label: "Create an Issue Comment",
	description: "Create a new comment on an issue on GitHub",
	parameters: z.object({
		body: z.string().describe("Comment content"),
		issueNumber: z.number().describe("Issue number to comment on"),
		owner: z.string().describe("Repository owner"),
		repo: z.string().describe("Repository name"),
	}),
} as const satisfies GitHubAction;

export const actions = [
	githubCreateIssueAction,
	githubCreateIssueCommentAction,
] as const;
