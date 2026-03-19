import type dns from "node:dns";
import { fetch } from "undici";
import { describe, expect, it, vi } from "vitest";
import { createSsrfSafeAgent, isPrivateIP, validateUrl } from "./validate-url";

let mockLookup: typeof dns.lookup;
vi.mock("node:dns", () => ({
	default: {
		lookup: (...args: Parameters<typeof mockLookup>) => mockLookup(...args),
	},
}));

describe("isPrivateIP", () => {
	it("should return true for private/internal addresses", () => {
		expect(isPrivateIP("127.0.0.1")).toBe(true);
		expect(isPrivateIP("::1")).toBe(true);
	});

	it("should return false for public addresses", () => {
		expect(isPrivateIP("8.8.8.8")).toBe(false);
		expect(isPrivateIP("2607:f8b0:4004:800::200e")).toBe(false);
	});

	it("should return true for invalid strings (safe side)", () => {
		expect(isPrivateIP("not-an-ip")).toBe(true);
	});
});

describe("validateUrl", () => {
	it("should reject invalid URLs", () => {
		expect(() => validateUrl("not-a-url")).toThrow("Invalid URL");
	});

	it("should reject file:// scheme", () => {
		expect(() => validateUrl("file:///etc/passwd")).toThrow("not allowed");
	});

	it("should reject ftp:// scheme", () => {
		expect(() => validateUrl("ftp://example.com/file")).toThrow("not allowed");
	});

	it("should allow http URLs", () => {
		expect(() => validateUrl("http://example.com")).not.toThrow();
	});

	it("should allow https URLs", () => {
		expect(() => validateUrl("https://example.com")).not.toThrow();
	});

	it("should reject private IPv4 addresses", () => {
		expect(() => validateUrl("http://127.0.0.1")).toThrow("private");
	});

	it("should reject IPv6 loopback", () => {
		expect(() => validateUrl("http://[::1]")).toThrow("private");
	});

	it("should allow public IP addresses", () => {
		expect(() => validateUrl("http://93.184.216.34")).not.toThrow();
	});
});

describe("createSsrfSafeAgent", () => {
	it("should block when DNS resolves to a private IP", async () => {
		mockLookup = vi.fn((_hostname, _options, callback) => {
			callback(null, "10.0.0.1", 4);
		}) as unknown as typeof dns.lookup;

		const agent = createSsrfSafeAgent();
		await expect(
			fetch("http://evil.example.com", { dispatcher: agent }),
		).rejects.toThrow();
	});
});
