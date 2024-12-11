"use client";

import { usePlaygroundMode } from "../contexts/playground-mode";
import { Editor } from "./editor";

export function Playground() {
	const { playgroundMode } = usePlaygroundMode();
	if (playgroundMode === "editor") {
		return <Editor />;
	}
	if (playgroundMode === "viewer") {
		return <div>Viewer</div>;
	}
	throw new Error("Invalid playground mode");
}
