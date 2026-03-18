import type dns from "node:dns";
import { describe, expect, it, vi } from "vitest";
import { isPrivateIP, validateUrlForFetch } from "./validate-url";

let mockLookup: typeof dns.promises.lookup;

vi.mock("node:dns", () => ({
	default: {
		promises: {
			lookup: (...args: Parameters<typeof mockLookup>) => mockLookup(...args),
		},
	},
}));

describe("isPrivateIP", () => {
	it("should return true for non-unicast addresses", () => {
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

describe("validateUrlForFetch", () => {
	it("should reject invalid URLs", async () => {
		await expect(validateUrlForFetch("not-a-url")).rejects.toThrow(
			"Invalid URL",
		);
	});

	it("should reject file:// scheme", async () => {
		await expect(validateUrlForFetch("file:///etc/passwd")).rejects.toThrow(
			"not allowed",
		);
	});

	it("should reject ftp:// scheme", async () => {
		await expect(validateUrlForFetch("ftp://example.com/file")).rejects.toThrow(
			"not allowed",
		);
	});

	it("should reject private IP addresses directly", async () => {
		await expect(validateUrlForFetch("http://127.0.0.1")).rejects.toThrow(
			"private",
		);
	});

	it("should block when DNS resolves to a private IP", async () => {
		mockLookup = vi
			.fn()
			.mockResolvedValue([{ address: "10.0.0.1", family: 4 }]);

		await expect(
			validateUrlForFetch("http://evil.example.com"),
		).rejects.toThrow("private");
	});

	it("should allow when DNS resolves to a public IP", async () => {
		mockLookup = vi
			.fn()
			.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);

		await expect(
			validateUrlForFetch("http://example.com"),
		).resolves.toBeUndefined();
	});

	it("should reject when hostname cannot be resolved", async () => {
		mockLookup = vi.fn().mockRejectedValue(new Error("ENOTFOUND"));

		await expect(
			validateUrlForFetch("http://nonexistent.invalid"),
		).rejects.toThrow("Unable to resolve");
	});
});
