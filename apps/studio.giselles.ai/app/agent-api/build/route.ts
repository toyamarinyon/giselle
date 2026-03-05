import { createBuildHandler } from "@giselles-ai/agent-builder/next-server";
import { verifyApiSecret } from "@/lib/api-keys";

const handler = createBuildHandler({
	verifyToken: async (token) => {
		const result = await verifyApiSecret({
			authorizationHeader: `Bearer ${token}`,
		});
		return result.ok;
	},
});

export function POST(request: Request) {
	return handler(request);
}
