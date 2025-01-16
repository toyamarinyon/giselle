export function objectToMap(args: unknown) {
	if (typeof args !== "object" || args === null || args instanceof Map) {
		return args;
	}
	return new Map(Object.entries(args));
}

export function mapToObject(args: unknown) {
	if (args instanceof Map) {
		return Object.fromEntries(args);
	}
	return args;
}
