import Langfuse from "langfuse";
import type {
	LangfuseEventClient,
	LangfuseGenerationClient,
	LangfuseSpanClient,
	LangfuseTraceClient,
} from "langfuse";
import type { TelemetrySettings } from "./telemetry-settings";

export function getLangfuse({ isEnabled = false }: TelemetrySettings) {
	return isEnabled ? new Langfuse() : noopLangfuse();
}

function noopLangfuseGenerationClient(): LangfuseGenerationClient {
	return {
		...langfuseObject,
		update() {
			return noopLangfuseGenerationClient();
		},
		end() {
			return noopLangfuseGenerationClient();
		},
	};
}
function noopLangfuseEventClient(): LangfuseEventClient {
	return langfuseObject;
}
const noopLangfuseClient = noopLangfuse();
const langfuseObject = {
	client: noopLangfuseClient,
	id: "noop-langfuse-client-id",
	traceId: "noop-langfuse-client-trace-id",
	observationId: "noop-langfuse-client-observation-id",
	span() {
		return noopLangfuseSpanClient();
	},
	event() {
		return noopLangfuseEventClient();
	},
	generation() {
		return noopLangfuseGenerationClient();
	},
	score() {
		return noopLangfuseSpanClient();
	},
	getTraceUrl() {
		return "";
	},
} as const;
function noopLangfuseSpanClient(): LangfuseSpanClient {
	return {
		...langfuseObject,
		update() {
			return noopLangfuseSpanClient();
		},
		end() {
			return noopLangfuseSpanClient();
		},
	};
}
function noopLanguseTraceClient(): LangfuseTraceClient {
	return {
		...langfuseObject,
		update() {
			return noopLanguseTraceClient();
		},
	};
}
export function noopLangfuse(): Langfuse {
	return {
		trace() {
			return noopLanguseTraceClient();
		},
	} as Langfuse;
}
