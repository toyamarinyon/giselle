import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import type { WorkspaceJson } from "./lib/giselle-data";
import { NextGiselleEngine } from "./lib/giselle-engine/next";

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
