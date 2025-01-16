import type { GiselleEngineContext } from "../types";

export type WorkspaceEngineHandlerArgs<TInput = void> = {
	context: GiselleEngineContext;
} & (TInput extends void ? Record<never, never> : { unsafeInput: unknown });
