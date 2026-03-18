import type dns from "node:dns";
import type { fetch } from "undici";
import { describe, expect, it, vi } from "vitest";
import { scrapeUrl } from "./self-made";

const TEST_URL = "https://example.com/";
const TEST_TXT_URL = "https://docs.giselles.ai/llms-full.txt";

// Mock URLs for testing edge cases (these won't be called in actual tests)
const TEST_UPPERCASE_TXT_URL = "https://example.com/TEST.TXT";
const TEST_UPPERCASE_MD_URL = "https://example.com/README.MD";

const hasExternalApiEnv = process.env.VITEST_WITH_EXTERNAL_API === "1";

vi.mock("node:dns", () => ({
	default: {
		lookup: (
			_hostname: string,
			_options: dns.LookupOptions,
			callback: (err: null, address: string, family: number) => void,
		) => {
			callback(null, "93.184.216.34", 4);
		},
	},
}));

let mockFetch: typeof fetch;
vi.mock("undici", async (importOriginal) => {
	const actual = await importOriginal<typeof import("undici")>();
	return {
		...actual,
		fetch: (...args: Parameters<typeof fetch>) => mockFetch(...args),
	};
});

describe("scrapeUrl (invalid URL)", () => {
	it("should throw on invalid URL", async () => {
		await expect(scrapeUrl("not-a-url")).rejects.toThrow();
	});
});

// Only run network-dependent tests if VITEST_WITH_EXTERNAL_API is set
(hasExternalApiEnv ? describe : describe.skip)("scrapeUrl (valid URL)", () => {
	it("should fetch a valid URL and return html (markdown empty)", async () => {
		const result = await scrapeUrl(TEST_URL, ["html"]);
		expect(result.title).toBe("Example Domain");
		expect(result).toHaveProperty("html");
		expect(result).toHaveProperty("markdown");
		expect(typeof result.html).toBe("string");
		expect(result.markdown).toBe("");
	});

	it("should fetch a valid URL and return markdown (html empty)", async () => {
		const result = await scrapeUrl(TEST_URL, ["markdown"]);
		expect(result.title).toBe("Example Domain");
		expect(result).toHaveProperty("html");
		expect(result).toHaveProperty("markdown");
		expect(result.html).toBe("");
		expect(typeof result.markdown).toBe("string");
		expect(result.markdown.length).toBeGreaterThan(0);
	});

	it("should fetch a valid URL and return both html and markdown", async () => {
		const result = await scrapeUrl(TEST_URL, ["html", "markdown"]);
		expect(result.title).toBe("Example Domain");
		expect(result).toHaveProperty("html");
		expect(result).toHaveProperty("markdown");
		expect(typeof result.html).toBe("string");
		expect(typeof result.markdown).toBe("string");
		expect(result.html.length).toBeGreaterThan(0);
		expect(result.markdown.length).toBeGreaterThan(0);
	});
});

// Test plain text/markdown files
(hasExternalApiEnv ? describe : describe.skip)(
	"scrapeUrl (plain text files)",
	() => {
		it("should fetch a .txt file and return unescaped markdown", async () => {
			const result = await scrapeUrl(TEST_TXT_URL, ["markdown"]);

			// Should extract filename as title for .txt files
			expect(result.title).toBe("llms-full.txt");
			expect(result).toHaveProperty("html");
			expect(result).toHaveProperty("markdown");
			expect(result.html).toBe("");
			expect(typeof result.markdown).toBe("string");
			expect(result.markdown.length).toBeGreaterThan(0);

			// Check that URLs are not escaped in the markdown content
			expect(result.markdown).toContain("https://docs.giselles.ai/");
			expect(result.markdown).not.toContain("\\/");

			// Check that markdown headers are not escaped
			expect(result.markdown).toContain("# ");
			expect(result.markdown).not.toContain("\\#");

			// Check that markdown bold markers are not escaped
			if (result.markdown.includes("**")) {
				expect(result.markdown).not.toContain("\\*\\*");
			}
		});

		it("should fetch a .txt file and return both html and markdown", async () => {
			const result = await scrapeUrl(TEST_TXT_URL, ["html", "markdown"]);

			expect(result.title).toBe("llms-full.txt");
			expect(typeof result.html).toBe("string");
			expect(typeof result.markdown).toBe("string");
			expect(result.html.length).toBeGreaterThan(0);
			expect(result.markdown.length).toBeGreaterThan(0);

			// For plain text files, html and markdown should be the same
			expect(result.html).toBe(result.markdown);
		});
	},
);

// Unit tests for edge cases with mocked fetch
describe("scrapeUrl (edge cases with mocks)", () => {
	it("should handle uppercase .TXT file extensions", async () => {
		const mockContent = "# Test Content\nThis is a test markdown file.";

		const mockHeaders = {
			get: (name: string) => (name === "content-type" ? "text/plain" : null),
		};
		mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			status: 200,
			headers: mockHeaders,
			text: () => Promise.resolve(mockContent),
		});

		const result = await scrapeUrl(TEST_UPPERCASE_TXT_URL, ["markdown"]);

		expect(result.title).toBe("TEST.TXT");
		expect(result.markdown).toBe(mockContent);
		expect(result.markdown).not.toContain("\\#"); // Should not be escaped
	});

	it("should handle uppercase .MD file extensions", async () => {
		const mockContent = "**Bold** and *italic* text with https://example.com";

		const mockHeaders = {
			get: (name: string) => (name === "content-type" ? "text/plain" : null),
		};
		mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			status: 200,
			headers: mockHeaders,
			text: () => Promise.resolve(mockContent),
		});

		const result = await scrapeUrl(TEST_UPPERCASE_MD_URL, ["markdown"]);

		expect(result.title).toBe("README.MD");
		expect(result.markdown).toBe(mockContent);
		expect(result.markdown).not.toContain("\\*\\*"); // Should not be escaped
		expect(result.markdown).not.toContain("\\/"); // URLs should not be escaped
	});

	it("should handle different markdown content-types", async () => {
		const mockContent = "**Bold text** and [link](https://example.com)";

		const mockHeaders = {
			get: (name: string) =>
				name === "content-type" ? "text/x-markdown; charset=utf-8" : null,
		};
		mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			status: 200,
			headers: mockHeaders,
			text: () => Promise.resolve(mockContent),
		});

		const result = await scrapeUrl("https://example.com/test.unknown", [
			"markdown",
		]);

		expect(result.markdown).toBe(mockContent);
		expect(result.markdown).not.toContain("\\*\\*"); // Should not be escaped
		expect(result.markdown).not.toContain("\\/"); // URLs should not be escaped
	});

	it("should handle application/markdown content-type", async () => {
		const mockContent = "# Header\n\nSome content with https://example.com/url";

		const mockHeaders = {
			get: (name: string) =>
				name === "content-type" ? "application/markdown" : null,
		};
		mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			status: 200,
			headers: mockHeaders,
			text: () => Promise.resolve(mockContent),
		});

		const result = await scrapeUrl("https://example.com/doc", ["markdown"]);

		expect(result.markdown).toBe(mockContent);
		expect(result.markdown).toContain("https://example.com/url");
		expect(result.markdown).not.toContain("\\#");
	});
});

describe("scrapeUrl (redirect SSRF protection)", () => {
	it("should block redirects to private IP addresses", async () => {
		mockFetch = vi.fn().mockResolvedValueOnce({
			status: 302,
			headers: {
				get: (name: string) =>
					name === "location"
						? "http://169.254.169.254/latest/meta-data/"
						: null,
			},
		});

		await expect(
			scrapeUrl("https://evil.example.com/redirect"),
		).rejects.toThrow("private");
	});

	it("should block redirects to loopback addresses", async () => {
		mockFetch = vi.fn().mockResolvedValueOnce({
			status: 301,
			headers: {
				get: (name: string) =>
					name === "location" ? "http://127.0.0.1/admin" : null,
			},
		});

		await expect(
			scrapeUrl("https://evil.example.com/redirect"),
		).rejects.toThrow("private");
	});

	it("should follow safe redirects successfully", async () => {
		const mockContent =
			"<html><head><title>Redirected</title></head><body>OK</body></html>";

		mockFetch = vi
			.fn()
			.mockResolvedValueOnce({
				status: 301,
				headers: {
					get: (name: string) =>
						name === "location" ? "https://example.com/final" : null,
				},
			})
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: {
					get: (name: string) => (name === "content-type" ? "text/html" : null),
				},
				text: () => Promise.resolve(mockContent),
			});

		const result = await scrapeUrl("https://example.com/start", ["html"]);
		expect(result.html).toBe(mockContent);
		expect(result.title).toBe("Redirected");
	});

	it("should throw on too many redirects", async () => {
		mockFetch = vi.fn().mockResolvedValue({
			status: 302,
			headers: {
				get: (name: string) =>
					name === "location" ? "https://example.com/loop" : null,
			},
		});

		await expect(scrapeUrl("https://example.com/loop")).rejects.toThrow(
			"Too many redirects",
		);
	});
});
