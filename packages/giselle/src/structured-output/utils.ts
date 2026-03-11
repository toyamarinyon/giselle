export function navigateObjectPath(
	value: unknown,
	path: string[],
): unknown | undefined {
	let current: unknown = value;
	for (const segment of path) {
		// Navigating into array element properties is not supported
		if (Array.isArray(current)) {
			return undefined;
		}

		if (current === null || typeof current !== "object") {
			return undefined;
		}

		const record = current as Record<string, unknown>;
		if (!(segment in record)) {
			return undefined;
		}
		current = record[segment];
	}

	return current;
}

export function resolveGeneratedTextContent(
	content: string,
	path?: string[],
): string | undefined {
	if (path === undefined || path.length === 0) {
		return content;
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(content);
	} catch {
		return undefined;
	}

	const extracted = navigateObjectPath(parsed, path);
	if (extracted === undefined) {
		return undefined;
	}

	if (typeof extracted === "object") {
		return JSON.stringify(extracted);
	}

	return String(extracted);
}
