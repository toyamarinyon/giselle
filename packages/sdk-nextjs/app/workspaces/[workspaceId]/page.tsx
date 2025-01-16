"use client";
import { useWorkflowDesigner } from "@/lib/workflow-designer";
import { Editor } from "@/lib/workflow-designer/ui";

export default function Page() {
	const { data, addTextGenerationNode, addTextNode } = useWorkflowDesigner();

	return (
		<div className="grid grid-cols-[200px_1fr] h-screen">
			<div>
				<button
					type="button"
					onClick={() => {
						addTextGenerationNode(
							{ name: "test text generation node" },
							{
								ui: {
									position: {
										x: Math.random() * 100,
										y: Math.random() * 100,
									},
								},
							},
						);
					}}
				>
					add text generation node
				</button>
				<button
					type="button"
					onClick={() => {
						addTextNode(
							{ name: "test textnode" },
							{
								ui: {
									position: {
										x: Math.random() * 100,
										y: Math.random() * 100,
									},
								},
							},
						);
					}}
				>
					add text node
				</button>
				<p>Nodes: {data.nodes.size}</p>
				<div>
					<p>Workflows</p>
					{Array.from(data.workflows.values()).map((workflow) => (
						<div key={workflow.id}>
							<p>Workflow: {workflow.id}</p>
							<p>Jobs: {workflow.jobSet.size}</p>
							<p>Nodes: {workflow.nodeSet.size}</p>
						</div>
					))}
				</div>
			</div>
			<div className="w-full h-full">
				<Editor />
			</div>
		</div>
	);
}
