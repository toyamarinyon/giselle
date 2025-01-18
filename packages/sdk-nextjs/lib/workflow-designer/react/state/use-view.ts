import { useState } from "react";
import { z } from "zod";

const ViewState = z.enum(["editor", "viewer"]);
export type ViewState = z.infer<typeof ViewState>;
export function useView() {
	const [view, setView] = useState<ViewState>("editor");
	return { view, setView };
}
