"use client";
import { Designer, useWorkflowDesigner } from "@/lib/workflow-designer/react";
import { useWorkflowRunner } from "@/lib/workflow-runner/react";
import { PlayIcon, WorkflowIcon } from "lucide-react";

export default function Page() {
	const {
		data,
		addTextGenerationNode,
		addTextNode,
		createWorkflowRun,
		setView,
	} = useWorkflowDesigner();
	const { setWorkflowRun, start, steps } = useWorkflowRunner();

	return (
		<div className="grid grid-cols-[200px_1fr] h-screen">
			<div className="font-mono p-[8px] bg-gradient-to-b from-black-100 to-black-100/90 text-black-30 text-[14px]">
				<p>[Tools]</p>
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
					+ Text Gen Node
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
					+ Text Node
				</button>
				<hr className="border-black-30/50 my-2" />
				<div className="overflow-x-hidden">
					<p>[Workflows]</p>
					{Array.from(data.editingWorkflowMap.values()).map((workflow) => (
						<div key={workflow.id} className="group">
							<div className="flex gap-1 items-center">
								<button
									type="button"
									className="w-[20px] h-[20px] flex-shrink-0 hover:bg-black-70 rounded flex items-center justify-center"
									onClick={async () => {
										const workflowRun = await createWorkflowRun({
											workflowId: workflow.id,
											onBeforeWorkflowRunCreate: () => {
												setView("viewer");
											},
										});
										setWorkflowRun(workflowRun);
										start();
									}}
								>
									<WorkflowIcon className="stroke-1 w-[20px] h-[20px] group-hover:hidden" />
									<PlayIcon className="stroke-1 w-[15px] hidden group-hover:block" />
								</button>
								<p className="whitespace-nowrap">{workflow.id}</p>
							</div>
							<div className="pl-[24px]">
								<p>├ Jobs: {workflow.jobMap.size}</p>
								<p>└ Nodes: {workflow.nodeMap.size}</p>
							</div>
						</div>
					))}
				</div>
				<hr className="border-black-30/50 my-2" />
				<div className="overflow-x-hidden">
					<p>[Workflow Run]</p>
					{steps.length === 0 ? (
						<p>null</p>
					) : (
						steps.map((step) => (
							<p key={step.id}>
								{step.id}, {step.status}
							</p>
						))
					)}
				</div>
			</div>
			<div className="w-full h-full">
				<Designer />
			</div>
		</div>
	);
}
