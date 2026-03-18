import dns from "node:dns";
import ipaddr from "ipaddr.js";
import { Agent } from "undici";

export function isPrivateIP(ip: string): boolean {
	if (!ipaddr.isValid(ip)) {
		return true;
	}
	const addr = ipaddr.process(ip);
	return addr.range() !== "unicast";
}

export function validateUrl(url: string): void {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error(`Invalid URL: ${url}`);
	}

	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw new Error(`URL scheme "${parsed.protocol}" is not allowed`);
	}

	rejectPrivateIPLiteral(parsed);
}

function rejectPrivateIPLiteral(parsed: URL): void {
	const rawHostname = parsed.hostname;

	// URL.hostname wraps IPv6 literals in brackets (e.g. "[::1]"),
	// which ipaddr.js cannot parse. Strip them before validation.
	const hostname =
		rawHostname.startsWith("[") && rawHostname.endsWith("]")
			? rawHostname.slice(1, -1)
			: rawHostname;

	if (ipaddr.isValid(hostname) && isPrivateIP(hostname)) {
		throw new Error(
			"Connection to private or internal IP addresses is not allowed",
		);
	}
}

export function createSsrfSafeAgent(): Agent {
	return new Agent({
		connect: {
			lookup: (hostname, options, callback) => {
				dns.lookup(
					hostname,
					{ ...options, all: false },
					(err, address, family) => {
						if (err) return callback(err, address, family);

						if (isPrivateIP(address)) {
							return callback(
								new Error(
									"Connection to private or internal IP addresses is not allowed",
								),
								address,
								family,
							);
						}

						return callback(null, address, family);
					},
				);
			},
		},
	});
}
