interface Data {
	installationId: string;
}
function assertData(data: unknown): asserts data is Data {
	if (
		typeof data !== "object" ||
		data === null ||
		!("installationId" in data)
	) {
		throw new Error("Invalid data");
	}
}
export async function POST(request: Request) {
	const json = await request.json();
	assertData(json);
	return Response.json(json);
}
