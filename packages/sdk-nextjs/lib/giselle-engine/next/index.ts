import type { NextRequest } from "next/server";
import { GiselleEngine, type GiselleEngineConfig } from "../core";

type AppRouteHandlers = Record<
	"GET" | "POST",
	(req: NextRequest) => Promise<Response>
>;

interface NextWorkflowEngineConfig extends GiselleEngineConfig {}
interface NextWokrflowEngineResult {
	handlers: AppRouteHandlers;
}

export function NextGiselleEngine(
	config: NextWorkflowEngineConfig,
): NextWokrflowEngineResult {
	const httpHandler = (req: NextRequest) => GiselleEngine(req, config);
	return {
		handlers: {
			GET: httpHandler,
			POST: httpHandler,
		},
	};
}
