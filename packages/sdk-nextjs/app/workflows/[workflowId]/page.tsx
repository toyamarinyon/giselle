"use client";
import { useWorkflowDesigner } from "@/lib/workflow-designer";
import { Editor, Node } from "@/lib/workflow-designer/ui";

export default function Page() {
	const { data, addTextGenerationNode, addTextNode } = useWorkflowDesigner();

	return (
		<div className="grid grid-cols-[250px_1fr] h-screen">
			<div>
				<button
					type="button"
					onClick={() => {
						addTextGenerationNode({ name: "test text generation node" });
					}}
				>
					add text generation node
				</button>
				<button
					type="button"
					onClick={() => {
						addTextNode({ name: "test textnode" });
					}}
				>
					add text node
				</button>
				<p>Nodes: {data.nodes.size}</p>
			</div>
			<div className="w-full h-full">
				<Editor />
			</div>
		</div>
	);
}
