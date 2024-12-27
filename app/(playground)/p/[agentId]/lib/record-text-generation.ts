import type { OtelLoggerWrapper } from "@/lib/opentelemetry";
import { createLogger } from "@/lib/opentelemetry/log";
import { waitUntil } from "@vercel/functions";
import type { Langfuse, LangfuseTraceClient } from "langfuse";
import { after } from "next/server";
import type { ExecutionId } from "../types";
import type { TelemetrySettings } from "./telemetry-settings";
import { getLangfuse } from "./tracer";

const sleepForOtelExportInterval = new Promise((resolve) =>
	setTimeout(
		resolve,
		Number.parseInt(process.env.OTEL_EXPORT_INTERVAL_MILLIS ?? "1000") +
			Number.parseInt(process.env.WAITUNTIL_OFFSET_MILLIS ?? "0"),
	),
);

function sendMetrics() {}

export async function withTelemetry<T>({
	scopeName,
	fn,
	telemetry = {
		isEnabled: false,
	},
}: {
	scopeName: string;
	fn: ({
		langfuse,
	}: { langfuse: Langfuse; logger: OtelLoggerWrapper }) => Promise<T>;
	telemetry?: TelemetrySettings;
}) {
	const startTime = Date.now();
	const langfuse = getLangfuse(telemetry);
	const logger = createLogger(scopeName);
	const result = await fn({ langfuse, logger });
	after(Promise.all([sleepForOtelExportInterval, langfuse.shutdownAsync()]));
	return result;
}
