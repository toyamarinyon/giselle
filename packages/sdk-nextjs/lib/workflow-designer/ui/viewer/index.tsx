"use client";

import type {
	JobRun,
	NodeData,
	Step,
	StepRun,
	WorkflowId,
	WorkflowRun,
	WorkflowRunId,
} from "@/lib/giselle-data";
import * as Tabs from "@radix-ui/react-tabs";
import { CircleAlertIcon, CircleSlashIcon } from "lucide-react";
import { type DetailedHTMLProps, useMemo } from "react";
import { useWorkflowDesigner } from "../../workflow-designer-context";
// import { useExecution } from "../contexts/execution";
// import { useGraph } from "../contexts/graph";
import { ContentTypeIcon, SpinnerIcon, WilliIcon } from "../icons";
import bg from "../images/bg.png";
// import { formatTimestamp } from "../lib/utils";
// import type { Execution, Node, StepExecution } from "../types";
// import ClipboardButton from "./clipboard-button";
// import { ContentTypeIcon } from "./content-type-icon";
// import { Header } from "./header";
// import { Markdown } from "./markdown";
// import { Button } from "./ui/button";
// import { EmptyState } from "./ui/empty-state";

interface StepExecutionButtonProps
	extends DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	step: Step;
	stepRun: StepRun;
	node: NodeData;
}
function StepButton({
	step,
	stepRun,
	node,
	...props
}: StepExecutionButtonProps) {
	return (
		<button
			type="button"
			className="flex items-center gap-[8px] rounded-[4px] px-[8px] py-[4px] data-[state=active]:bg-black-80"
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
					contentType={node.content.type}
					className="w-[18px] h-[18px] fill-current text-white"
				/>
			)}

			<div className="flex flex-col items-start">
				<p className="truncate text-[14px] font-rosart">{node.content.type}</p>
				<p className="line-clamp-1 font-rosart text-black-70 text-[8px]">
					{node.name} / {stepRun.status}
				</p>
			</div>
		</button>
	);
}

function jobRunKey(
	workflowRun: WorkflowRun,
	jobRun: JobRun,
	jobRunIndex: number,
) {
	return `${workflowRun.id}.jobs[${jobRunIndex}]#${jobRun.attempts}`;
}

function stepRunKey(
	workflowRun: WorkflowRun,
	jobRun: JobRun,
	jobRunIndex: number,
	stepRun: StepRun,
	stepRunIndex: number,
) {
	return `${workflowRun.id}.jobs[${jobRunIndex}].steps[${stepRun.stepId}]#${stepRun.attempts}`;
}

function WorkflowRunViewer({
	workflowRunId,
}: { workflowRunId: WorkflowRunId }) {
	const { data } = useWorkflowDesigner();
	const workflowRun = useMemo(() => {
		const workflowRun = data.workflowRunMap.get(workflowRunId);
		if (workflowRun === undefined) {
			throw new Error(`Workflow run with id ${workflowRunId} not found`);
		}
		return workflowRun;
	}, [data.workflowRunMap, workflowRunId]);
	const workflow = useMemo(() => {
		const workflow = data.workflowMap.get(workflowRun.workflowId);
		if (workflow === undefined) {
			throw new Error(`Workflow with id ${workflowRun.workflowId} not found`);
		}
		return workflow;
	}, [data.workflowMap, workflowRun.workflowId]);
	return (
		<Tabs.Root className="flex-1 flex w-full gap-[16px] pt-[16px] overflow-hidden h-full mx-[20px]">
			<div className="w-[200px]">
				<Tabs.List className="flex flex-col gap-[8px]">
					{Array.from(workflowRun.jobRunSet).map((jobRun, jobRunIndex) => (
						<div key={jobRunKey(workflowRun, jobRun, jobRunIndex)}>
							<p className="text-[12px] text-black-30 mb-[4px]">
								Job {jobRunIndex + 1}
							</p>
							<div className="flex flex-col gap-[4px]">
								{Array.from(jobRun.stepRunSet).map((stepRun, stepRunIndex) => (
									<Tabs.Trigger
										key={stepRunKey(
											workflowRun,
											jobRun,
											jobRunIndex,
											stepRun,
											stepRunIndex,
										)}
										value={stepRunKey(
											workflowRun,
											jobRun,
											jobRunIndex,
											stepRun,
											stepRunIndex,
										)}
										asChild
									>
										<StepButton
											step={workflow.}
											stepRun={stepRun}
											node={stepRun.node}
										/>
									</Tabs.Trigger>
								))}
							</div>
						</div>
					))}
				</Tabs.List>
			</div>
			<div className="overflow-y-auto flex-1 pb-[20px]">
				{execution.jobRuns.flatMap((jobExecution) =>
					jobExecution.stepExecutions.map((stepExecution) => (
						<Tabs.Content key={stepExecution.id} value={stepExecution.id}>
							{stepExecution.status === "pending" && <p>Pending</p>}
							{stepExecution.status === "failed" && (
								<div className="flex flex-col gap-[8px]">
									<p>{stepExecution.error}</p>
									<div>
										<Button
											type="button"
											onClick={() => {
												retryFlowExecution(execution.id);
											}}
										>
											Retry
										</Button>
									</div>
								</div>
							)}
							{(stepExecution.status === "running" ||
								stepExecution.status === "completed") && (
								<Markdown>{stepExecution.artifact?.object.content}</Markdown>
							)}
							{stepExecution.artifact?.type === "generatedArtifact" && (
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
							)}
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
	const { execution } = useExecution();
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
				{execution === null ? (
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
					<WorkflowRunViewer execution={execution} />
				)}
			</div>
		</div>
	);
}
