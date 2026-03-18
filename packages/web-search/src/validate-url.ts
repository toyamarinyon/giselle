import dns from "node:dns";
import ipaddr from "ipaddr.js";

export function isPrivateIP(ip: string): boolean {
	if (!ipaddr.isValid(ip)) {
		return true;
	}
	const addr = ipaddr.process(ip);
	return addr.range() !== "unicast";
}

export async function validateUrlForFetch(url: string): Promise<void> {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error(`Invalid URL: ${url}`);
	}

	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw new Error(`URL scheme "${parsed.protocol}" is not allowed`);
	}

	const rawHostname = parsed.hostname;
	if (!rawHostname) {
		throw new Error("URL must include a host");
	}

	// URL.hostname wraps IPv6 literals in brackets (e.g. "[::1]"),
	// which ipaddr.js cannot parse. Strip them before validation.
	const hostname =
		rawHostname.startsWith("[") && rawHostname.endsWith("]")
			? rawHostname.slice(1, -1)
			: rawHostname;

	if (ipaddr.isValid(hostname)) {
		if (isPrivateIP(hostname)) {
			throw new Error(
				"Connection to private or internal IP addresses is not allowed",
			);
		}
		return;
	}

	let addresses: dns.LookupAddress[];
	try {
		addresses = await dns.promises.lookup(hostname, { all: true });
	} catch {
		throw new Error(`Unable to resolve hostname: ${hostname}`);
	}

	for (const { address } of addresses) {
		if (isPrivateIP(address)) {
			throw new Error(
				"Connection to private or internal IP addresses is not allowed",
			);
		}
	}
}
