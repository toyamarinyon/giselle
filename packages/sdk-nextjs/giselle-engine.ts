import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import { NextGiselleEngine } from "./lib/giselle-engine/next";
import type { WorkspaceJson } from "./lib/workflow-data";

const storage = createStorage<WorkspaceJson>({
	// driver: vercelBlobDriver({
	// 	access: "public",
	// 	base: "workflow-data",
	// }),
	driver: fsDriver({
		base: "./.storage/workspaces",
	}),
});

export const giselleEngine = NextGiselleEngine({
	basePath: "/api/giselle",
	storage,
});
