import type { WorkspaceJson } from "@/lib/giselle-data";
import type { Storage } from "unstorage";
import { z } from "zod";
import { createWorkspace } from "./handlers/create-workspace";
import { getWorkspace } from "./handlers/get-workspace";
import { runStep } from "./handlers/run-step";
import { saveWorkspace } from "./handlers/save-workspace";
import { textGeneration } from "./handlers/text-generation";
import type { GiselleEngineContext } from "./types";

export const GiselleEngineAction = z.enum([
	"create-workspace",
	"save-workspace",
	"get-workspace",
	"text-generation",
	"run-step",
]);
type GiselleEngineAction = z.infer<typeof GiselleEngineAction>;

export interface GiselleEngineRequest {
	action: GiselleEngineAction;
	payload: unknown;
	context: GiselleEngineContext;
}

export interface GiselleEngineConfig {
	basePath: string;
	storage: Storage<WorkspaceJson>;
}

async function toGiselleEngineRequest(
	request: Request,
	config: GiselleEngineConfig,
): Promise<GiselleEngineRequest> {
	request.url;
	const url = new URL(request.url);
	const pathname = url.pathname;
	const a = url.pathname.match(new RegExp(`^${config.basePath}(.+)`));

	const segmentString = a?.at(-1);
	if (segmentString == null)
		throw new Error(`Cannot parse action at ${pathname}`);
	const segments = segmentString.replace(/^\//, "").split("/").filter(Boolean);

	if (segments.length !== 1) {
		throw new Error(`Invalid action at ${pathname}`);
	}

	const [unsafeAction] = segments;

	const action = GiselleEngineAction.parse(unsafeAction);

	async function getBody(
		req: Request,
	): Promise<Record<string, unknown> | undefined> {
		if (!("body" in req) || !req.body || req.method !== "POST") return;

		const contentType = req.headers.get("content-type");
		if (contentType?.includes("application/json")) {
			return await req.json();
		}
		if (contentType?.includes("application/x-www-form-urlencoded")) {
			const params = new URLSearchParams(await req.text());
			return Object.fromEntries(params);
		}
	}
	return {
		action,
		payload: request.body ? await getBody(request) : undefined,
		context: {
			storage: config.storage,
		},
	};
}

export async function GiselleEngine(
	request: Request,
	config: GiselleEngineConfig,
): Promise<Response> {
	const { action, payload, context } = await toGiselleEngineRequest(
		request,
		config,
	);
	switch (action) {
		case "save-workspace": {
			const result = await saveWorkspace({
				context,
				unsafeInput: payload,
			});
			return Response.json(result);
		}
		case "get-workspace": {
			const result = await getWorkspace({
				unsafeInput: payload,
				context,
			});
			return Response.json(result);
		}
		case "text-generation": {
			const stream = await textGeneration({
				context,
				unsafeInput: payload,
			});
			return stream.toDataStreamResponse();
		}
		case "create-workspace": {
			const result = await createWorkspace({ context });
			return Response.json(result);
		}
		case "run-step": {
			const stream = await runStep({ context, unsafeInput: payload });
			return stream.toDataStreamResponse();
		}
		default: {
			const _exhaustiveCheck: never = action;
			return _exhaustiveCheck;
		}
	}
}
