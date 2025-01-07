import { put } from "@vercel/blob";
import type { StorageClient } from "../workflow";

export function createVercelBlobStorageClient(): StorageClient {
	if (process.env.BLOB_READ_WRITE_TOKEN === undefined) {
		throw new Error("BLOB_READ_WRITE_TOKEN is not set");
	}
	return {
		put: async (keyName: string, keyValue: string) => {
			await put(keyName, keyValue, {
				access: "public",
			});
		},
	};
}
