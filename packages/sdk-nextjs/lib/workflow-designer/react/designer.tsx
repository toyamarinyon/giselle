import { Editor } from "./editor";
import { Viewer } from "./viewer";
import { useWorkflowDesigner } from "./workflow-designer-context";

export function Designer() {
	const { view } = useWorkflowDesigner();
	switch (view) {
		case "editor":
			return <Editor />;
		case "viewer":
			return <Viewer />;
		default:
			return null;
	}
}
