import { describe, expect, it } from "vitest";
import { actions } from "./index";

describe("actions", () => {
	it("should have unique ids", () => {
		const ids = actions.map((action) => action.id);
		const uniqueIds = new Set(ids);

		// Print duplicates if any for easier debugging
		const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
		if (duplicates.length > 0) {
			console.error("Duplicate action ids found:", duplicates);
		}

		expect(uniqueIds.size).toBe(ids.length);
	});
});
