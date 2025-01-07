import type { StorageClient } from "../workflow";

export function createLocalStorageClient(): StorageClient {
	if (typeof window === "undefined") {
		throw new Error("localStorage requires browser runtime");
	}
	return {
		put: async (keyName: string, keyValue: string) => {
			localStorage.setItem(keyName, keyValue);
		},
	};
}
