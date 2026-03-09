import { createAgentApi } from "@giselles-ai/agent/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { verifyApiSecret } from "@/lib/api-keys";
import {
	buildRateLimitHeaders,
	consumeTeamRateLimit,
} from "../../api/_lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authAndRateLimitHook(
	request: Request,
): Promise<Response | undefined> {
	const verifyResult = await verifyApiSecret({
		authorizationHeader: request.headers.get("authorization"),
	});
	if (!verifyResult.ok) {
		return Response.json(
			{ ok: false, errorCode: "UNAUTHORIZED", message: "Unauthorized." },
			{ status: 401 },
		);
	}

	const [teamRecord] = await db
		.select({ plan: teams.plan })
		.from(teams)
		.where(eq(teams.dbId, verifyResult.teamDbId))
		.limit(1);

	if (!teamRecord) {
		return Response.json(
			{ ok: false, errorCode: "UNAUTHORIZED", message: "Unauthorized." },
			{ status: 401 },
		);
	}

	const rateLimit = await consumeTeamRateLimit({
		teamDbId: verifyResult.teamDbId,
		plan: teamRecord.plan,
		routeKey: "agent_api_run",
		now: new Date(),
	});

	if (!rateLimit.allowed) {
		const rateLimitHeaders = buildRateLimitHeaders({
			limit: rateLimit.limit,
			remaining: rateLimit.remaining,
			resetAt: rateLimit.resetAt,
			retryAfterSeconds: rateLimit.retryAfterSeconds,
		});
		return new Response("Rate limit exceeded", {
			status: 429,
			headers: rateLimitHeaders,
		});
	}
}

const api = createAgentApi({
	basePath: "/agent-api",
	store: { adapter: "redis" },
	agent: {
		tools: {
			browser: {
				relayClient: {
					headers: {
						"x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS,
					},
				},
			},
		},
	},
	hooks: {
		chat: { before: authAndRateLimitHook },
		build: { before: authAndRateLimitHook },
	},
});

export const GET = api.GET;
export const POST = api.POST;
export const OPTIONS = api.OPTIONS;
