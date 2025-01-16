import type { WorkspaceJson } from "@/lib/giselle-data";
import type { Storage } from "unstorage";

export interface GiselleEngineContext {
	storage: Storage<WorkspaceJson>;
}
