import type { WorkspaceJson } from "@/lib/workflow-data";
import type { Storage } from "unstorage";

export interface GiselleEngineContext {
	storage: Storage<WorkspaceJson>;
}
