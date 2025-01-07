import { createLocalStorageClient } from "./storage/local";
import { createVercelBlobStorageClient } from "./storage/vercel-blob";

interface Workflow {
	storage: StorageClient;
}
interface WorkflowConfiguration {
	storage: StorageConfiguration;
}
export interface StorageClient {
	put(keyName: string, keyValue: string): Promise<void>;
}
interface StorageConfigurationBase {
	type: string;
}
interface LocalStorageConfiguration extends StorageConfigurationBase {
	type: "local";
}
interface RemoteStorageConfigurationBase extends StorageConfigurationBase {
	type: "remote";
	provider: string;
}
interface VercelBlobStorageConfiguration
	extends RemoteStorageConfigurationBase {
	provider: "vercel-blob";
}
type StorageConfiguration =
	| LocalStorageConfiguration
	| VercelBlobStorageConfiguration;

function createStorageClient(config: StorageConfiguration): StorageClient {
	if (config.type === "local") {
		return createLocalStorageClient();
	}
	if (config.type === "remote") {
		if (config.provider === "vercel-blob") {
			return createVercelBlobStorageClient();
		}
	}
	throw new Error("Invalid storage configuration");
}
export function initWorkflow(config: WorkflowConfiguration): Workflow {
	const storage = createStorageClient(config.storage);
	return {
		storage,
	};
}
