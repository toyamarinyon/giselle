"use client";

import type { StepRun } from "@/lib/giselle-data";
import { WorkflowRunner, useWorkflowRunner } from "@/lib/workflow-runner/react";
import * as Tabs from "@radix-ui/react-tabs";
import { CircleAlertIcon, CircleSlashIcon } from "lucide-react";
import type { DetailedHTMLProps } from "react";
import bg from "../../images/bg.png";
import { EmptyState } from "../_/empty-state";
import { Header } from "../_/header";
import { Markdown } from "../_/markdown";
import { ContentTypeIcon, SpinnerIcon, WilliIcon } from "../icons";

interface StepRunButtonProps
	extends DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	stepRun: StepRun;
}
function StepButton({ stepRun, ...props }: StepRunButtonProps) {
	return (
		<button
			type="button"
			className="flex items-center gap-[8px] rounded-[4px] px-[8px] py-[4px] data-[state=active]:bg-black-80 text-white"
			{...props}
		>
			{stepRun.status === "queued" && (
				<SpinnerIcon className="w-[18px] h-[18px] stroke-black-30 fill-transparent" />
			)}
			{stepRun.status === "failed" && (
				<CircleAlertIcon className="w-[18px] h-[18px] stroke-black-30 fill-transparent" />
			)}
			{stepRun.status === "cancelled" && (
				<CircleSlashIcon className="w-[18px] h-[18px] stroke-black-30 fill-transparent" />
			)}
			{stepRun.status === "inProgress" && (
				<SpinnerIcon className="w-[18px] h-[18px] stroke-black-30 animate-follow-through-spin fill-transparent" />
			)}
			{stepRun.status === "completed" && (
				<ContentTypeIcon
					contentType={stepRun.node.content.type}
					className="w-[18px] h-[18px] fill-current text-white"
				/>
			)}

			<div className="flex flex-col items-start">
				<p className="truncate text-[14px] font-rosart">
					{stepRun.node.content.type}
				</p>
				<p className="line-clamp-1 font-rosart text-black-70 text-[8px]">
					{stepRun.node.name} / {stepRun.status}
				</p>
			</div>
		</button>
	);
}

function WorkflowRunViewer() {
	const { workflowRun, steps } = useWorkflowRunner();
	if (workflowRun === undefined) {
		return null;
	}
	return (
		<Tabs.Root className="flex-1 flex w-full gap-[16px] pt-[16px] overflow-hidden h-full mx-[20px]">
			<div className="w-[200px]">
				<Tabs.List className="flex flex-col gap-[8px]">
					{Array.from(workflowRun.jobRunMap).map(
						([jobRunId, jobRun], jobRunIndex) => (
							<div key={jobRunId}>
								<p className="text-[12px] text-black-30 mb-[4px]">
									Job {jobRunIndex + 1}
								</p>
								<div className="flex flex-col gap-[4px]">
									{Array.from(jobRun.stepRunMap).map(
										([stepRunId, stepRun], stepRunIndex) => (
											<Tabs.Trigger key={stepRunId} value={stepRunId} asChild>
												<StepButton stepRun={stepRun} key={stepRunId} />
											</Tabs.Trigger>
										),
									)}
								</div>
							</div>
						),
					)}
				</Tabs.List>
			</div>
			<div className="overflow-y-auto flex-1 pb-[20px]">
				{Array.from(workflowRun.jobRunMap).flatMap(([jobId, job]) =>
					Array.from(job.stepRunMap).map(([stepId, step]) => (
						<Tabs.Content key={stepId} value={stepId}>
							{step.status === "queued" && <p>Qeued</p>}
							{step.status === "failed" && (
								<div className="flex flex-col gap-[8px]">
									<p>error</p>
									{/* <p>{stepExecution.error}</p> */}
									{/* <div>
										<Button
											type="button"
											onClick={() => {
												retryFlowExecution(execution.id);
											}}
										>
											Retry
										</Button>
									</div> */}
								</div>
							)}
							{(step.status === "inProgress" ||
								step.status === "completed") && (
								<Markdown>{step.result}</Markdown>
							)}
							{/* {stepExecution.artifact?.type === "generatedArtifact" && (
								<div className="mt-[10px] flex gap-[12px] items-center">
									<div className="text-[14px] font-bold text-black-70 ">
										Generated{" "}
										{formatTimestamp.toRelativeTime(
											stepExecution.artifact.createdAt,
										)}
									</div>
									<div className="text-black-30 flex items-center">
										<ClipboardButton
											text={stepExecution.artifact.object.content}
											sizeClassName="w-[16px] h-[16px]"
										/>
									</div>
									<div className="text-black-30 text-[14px]">
										<button
											type="button"
											onClick={() => {
												retryFlowExecution(execution.id, stepExecution.stepId);
											}}
										>
											Retry
										</button>
									</div>
								</div>
							)} */}
						</Tabs.Content>
					)),
				)}
				{/* {state.flow.jobs.flatMap((job) =>
					job.steps
						.filter(
							(step) =>
								step.status === stepStatuses.streaming ||
								step.status === stepStatuses.completed,
						)
						.map((step) => (
							<Tabs.Content key={step.id} value={step.id}>
								{step.output.object === "artifact.text" ? (
									<ArtifactRender
										title={step.output.title}
										content={step.output.content}
									/>
								) : (
									<div className="px-[16px] py-[16px] font-rosart text-[18px] text-black-30">
										<table className="w-full divide-y divide-black-40 font-avenir border-separate border-spacing-[16px] text-left text-black-70 ">
											<colgroup>
												<col width="0%" />
												<col width="100%" />
												<col width="0%" />
											</colgroup>
											<thead className="font-[500] text-[12px]">
												<tr>
													<th>Status</th>
													<th>Content</th>
													<th>Relevance</th>
												</tr>
											</thead>
											<tbody className="">
												{step.output.scrapingTasks.map((scrapingTask) => (
													<tr key={scrapingTask.id}>
														<td>
															{scrapingTask.state === "completed" ? (
																<CircleCheckIcon className="w-[20px] h-[20px] fill-green" />
															) : scrapingTask.state === "failed" ? (
																<CircleXIcon className="w-[20px] h-[20px] fill-[hsla(11,100%,50%,1)]" />
															) : (
																""
															)}
														</td>
														<td className="text-black-30 max-w-[1px]">
															<p className="font-rosart text-[18px] underline truncate">
																{scrapingTask.title}
															</p>
															<p className="text-[12px] truncate">
																{scrapingTask.url}
															</p>
														</td>
														<td className="text-green font-[900]">
															{Math.min(
																0.99,
																Number.parseFloat(
																	scrapingTask.relevance.toFixed(2),
																),
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</Tabs.Content>
						)),
				)} */}
			</div>
		</Tabs.Root>
	);
}

export function Viewer() {
	const { workflowRun } = useWorkflowRunner();
	return (
		<div
			className="w-full h-screen bg-black-100 flex flex-col"
			style={{
				backgroundImage: `url(${bg.src})`,
				backgroundPositionX: "center",
				backgroundPositionY: "center",
				backgroundSize: "cover",
			}}
		>
			<Header />
			<div className="flex-1 w-full flex items-center justify-center overflow-hidden">
				{workflowRun === undefined ? (
					<EmptyState
						icon={
							<WilliIcon className="fill-current w-[32px] h-[32px] text-black-30" />
						}
						title="This has not yet been executed"
						description="You have not yet
					executed the node. Let's execute entire thing and create the final
					output."
					/>
				) : (
					<>
						<WorkflowRunViewer />
						<WorkflowRunner />
					</>
				)}
			</div>
		</div>
	);
}
