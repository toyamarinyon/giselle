import { listApiSecretRecordsForTeam } from "@/lib/api-keys";
import { fetchCurrentTeam } from "@/services/teams";
import { ApiKeysPageClient } from "./page-client";

export default async function ApiKeysPage() {
	const team = await fetchCurrentTeam();
	const apiKeys = await listApiSecretRecordsForTeam(team.dbId);

	return <ApiKeysPageClient apiKeys={apiKeys} />;
}
