import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import { NextGiselleEngine } from "./lib/giselle-engine/next";

const storage = createStorage({
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
