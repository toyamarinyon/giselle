import { describe, expect, it } from "vitest";
import { scrapeUrl } from "./self-made";

const TEST_URL = "https://example.com/";
const TEST_TXT_URL = "https://docs.giselles.ai/llms-full.txt";

const hasExternalApiEnv = process.env.VITEST_WITH_EXTERNAL_API === "1";

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

(hasExternalApiEnv ? describe : describe.skip)(
	"scrapeUrl (plain text files)",
	() => {
		it("should fetch a .txt file and return unescaped markdown", async () => {
			const result = await scrapeUrl(TEST_TXT_URL, ["markdown"]);

			expect(result.title).toBe("llms-full.txt");
			expect(result).toHaveProperty("html");
			expect(result).toHaveProperty("markdown");
			expect(result.html).toBe("");
			expect(typeof result.markdown).toBe("string");
			expect(result.markdown.length).toBeGreaterThan(0);

			expect(result.markdown).toContain("https://docs.giselles.ai/");
			expect(result.markdown).not.toContain("\\/");

			expect(result.markdown).toContain("# ");
			expect(result.markdown).not.toContain("\\#");

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

			expect(result.html).toBe(result.markdown);
		});
	},
);
