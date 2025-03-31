"use client";

import { WorkflowId } from "@giselle-sdk/data-type";
import clsx from "clsx/lite";
import {
	useRun,
	useRunController,
	useWorkflowDesigner,
} from "giselle-sdk/react";
import {
	ChevronDownIcon,
	CircleCheckIcon,
	CircleSlashIcon,
	XCircleIcon,
} from "lucide-react";
import { Popover, Tabs } from "radix-ui";
import { useMemo, useState } from "react";
import { useUsageLimitsReached } from "../hooks/usage-limits";
import { SpinnerIcon, WilliIcon } from "../icons";
import bg from "../images/bg.png";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { GenerationView } from "../ui/generation-view";
import { NodeGlance } from "../ui/node-glance";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { UsageLimitWarning } from "../ui/usage-limit-warning";

export function Viewer() {
	const { generations, run } = useRun();
	const { perform, isRunning, cancel } = useRunController();
	const { data } = useWorkflowDesigner();
	const usageLimitsReached = useUsageLimitsReached();

	const [flowId, setFlowId] = useState<WorkflowId | undefined>(
		data.editingWorkflows.length === 1
			? data.editingWorkflows[0].id
			: undefined,
	);
	const flow = useMemo(
		() => data.editingWorkflows.find((flow) => flow.id === flowId),
		[flowId, data.editingWorkflows],
	);
	return (
		<div className="w-full flex-1 px-[16px] pb-[16px] font-sans overflow-hidden">
			<div className="rounded-[8px] overflow-hidden h-full">
				<div
					className="bg-black-800 flex flex-col h-full text-white-900 px-[16px] py-[16px] gap-[16px]"
					style={{
						backgroundImage: `url(${bg.src})`,
						backgroundPositionX: "center",
						backgroundPositionY: "center",
						backgroundSize: "cover",
					}}
				>
					<Tabs.Root orientation="horizontal" className="flex h-full">
						<Tabs.List className="w-[180px] flex flex-col gap-[16px]">
							<div className="flex flex-col gap-[8px]">
								{data.editingWorkflows.length > 1 && (
									<Select
										onValueChange={(value) => {
											setFlowId(WorkflowId.parse(value));
										}}
										defaultValue={flowId}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select flow" />
										</SelectTrigger>
										<SelectContent>
											{data.editingWorkflows.map((workflow, index) => (
												<SelectItem key={workflow.id} value={workflow.id}>
													flow {index + 1}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}

								{usageLimitsReached && <UsageLimitWarning />}

								{flowId &&
									(isRunning ? (
										<Button
											type="button"
											onClick={() => {
												cancel();
											}}
											loading={true}
										>
											Stop
										</Button>
									) : (
										<div className="w-full relative">
											<Button
												type="button"
												disabled={usageLimitsReached}
												className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
												onClick={() => {
													if (usageLimitsReached) {
														return;
													}
													perform(flowId);
												}}
											>
												Run
											</Button>
											<div className="absolute right-[8px] top-[50%] translate-y-[-50%] h-full flex items-center justify-center">
												<div className="w-[1px] h-full border-l border-white-800/40 mr-[6px]" />
												<Popover.Root>
													<Popover.Trigger asChild>
														<button
															type="button"
															className="hover:bg-black-800/20 rounded-[4px]"
														>
															<ChevronDownIcon className="size-[18px]" />
														</button>
													</Popover.Trigger>
													<Popover.Portal>
														<Popover.Content
															className="w-[260px] rounded bg-black-900/20 backdrop-blur-[4px] rounded-[8px] px-[8px] py-[8px]"
															sideOffset={5}
														>
															<div className="absolute z-0 rounded-[8px] inset-0 border mask-fill bg-gradient-to-br from-[hsla(232,37%,72%,0.2)] to-[hsla(218,58%,21%,0.9)] bg-origin-border bg-clip-boarder border-transparent" />
															<div className="flex flex-col gap-2.5 relative text-white-800">
																<p className="mb-2.5 text-[15px] font-medium leading-[19px] text-mauve12">
																	Dimensions
																</p>
																<fieldset className="flex items-center gap-5">
																	<label
																		className="w-[75px] text-[13px] text-violet11"
																		htmlFor="width"
																	>
																		Width
																	</label>
																	<input
																		className="inline-flex h-[25px] w-full flex-1 items-center justify-center rounded px-2.5 text-[13px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-violet8"
																		id="width"
																		defaultValue="100%"
																	/>
																</fieldset>
																<fieldset className="flex items-center gap-5">
																	<label
																		className="w-[75px] text-[13px] text-violet11"
																		htmlFor="maxWidth"
																	>
																		Max. width
																	</label>
																	<input
																		className="inline-flex h-[25px] w-full flex-1 items-center justify-center rounded px-2.5 text-[13px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-violet8"
																		id="maxWidth"
																		defaultValue="300px"
																	/>
																</fieldset>
																<fieldset className="flex items-center gap-5">
																	<label
																		className="w-[75px] text-[13px] text-violet11"
																		htmlFor="height"
																	>
																		Height
																	</label>
																	<input
																		className="inline-flex h-[25px] w-full flex-1 items-center justify-center rounded px-2.5 text-[13px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-violet8"
																		id="height"
																		defaultValue="25px"
																	/>
																</fieldset>
																<fieldset className="flex items-center gap-5">
																	<label
																		className="w-[75px] text-[13px] text-violet11"
																		htmlFor="maxHeight"
																	>
																		Max. height
																	</label>
																	<input
																		className="inline-flex h-[25px] w-full flex-1 items-center justify-center rounded px-2.5 text-[13px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-violet8"
																		id="maxHeight"
																		defaultValue="none"
																	/>
																</fieldset>
															</div>
															<Popover.Arrow className="fill-white" />
														</Popover.Content>
													</Popover.Portal>
												</Popover.Root>
											</div>
										</div>
									))}
							</div>
							<div className="flex flex-col gap-[24px]">
								{flow?.jobs.map((job, index) => (
									<div key={job.id} className="flex flex-col gap-[8px]">
										<p className="text-black-400 text-[12px] font-[700]">
											Step {index + 1}
										</p>
										{job.actions.map((action) => (
											<Tabs.Trigger
												value={action.node.id}
												className={clsx(
													"[w-180px] flex p-[16px] justify-between items-center border border-black-200/20 rounded-[8px] gap-[4px]",
													"hover:border-black-200/60",
													"data-[state=active]:border-primary-900",
													"transition-colors",
												)}
												key={`tabs-trigger-${action.node.id}`}
											>
												<NodeGlance
													node={action.node}
													iconClassName="rounded-[8px] bg-white-950 text-black-950 flex items-center justify-center p-[8px] **:data-content-type-icon:size-[16px]"
													nameClassName="text-white-900 text-[12px] font-[700] truncate w-full"
													descriptionClassName="text-black-400 text-[10px]"
												/>
												{generations
													.filter(
														(generation) =>
															generation.context.actionNode.id ===
															action.node.id,
													)
													.map((generation) => {
														switch (generation.status) {
															case "created":
															case "queued":
															case "running":
																return (
																	<SpinnerIcon
																		className="size-[22px] text-white-800 animate-follow-through-overlap-spin shrink-0"
																		key={generation.id}
																	/>
																);
															case "completed":
																return (
																	<CircleCheckIcon
																		className="size-[22px] text-success-900 shrink-0"
																		key={generation.id}
																	/>
																);
															case "failed":
																return (
																	<XCircleIcon
																		className="size-[22px] text-error-900 shrink-0"
																		key={generation.id}
																	/>
																);
															case "cancelled":
																return (
																	<CircleSlashIcon
																		className="size-[22px] text-white-800 shrink-0"
																		key={generation.id}
																	/>
																);
															default: {
																const _exhaustiveCheck: never =
																	generation.status;
																throw new Error(
																	`Unhandled status: ${_exhaustiveCheck}`,
																);
															}
														}
													})}
											</Tabs.Trigger>
										))}
									</div>
								))}
							</div>
						</Tabs.List>
						<div className="overflow-y-auto flex-1 pb-[20px]">
							{(!run || run.status === "created") && (
								<div className="h-full flex items-center justify-center">
									<EmptyState
										icon={
											<WilliIcon className="fill-current w-[32px] h-[32px] text-black-300" />
										}
										title="This has not yet been executed"
										description="You have not yet
													executed the node. Let's execute entire thing and create the final
													output."
									/>
								</div>
							)}
							{run &&
								run.status !== "created" &&
								run?.workflow?.jobs.flatMap((job) =>
									job.actions.map(({ node }) => (
										<Tabs.Content
											key={node.id}
											value={node.id}
											className="px-[32px] py-[16px] flex flex-col gap-[24px]"
										>
											<NodeGlance
												node={node}
												iconClassName="rounded-[8px] bg-white-950 text-black-950 flex items-center justify-center p-[8px] **:data-content-type-icon:size-[26px]"
												nameClassName="text-white-900 text-[20px] font-[700]"
												descriptionClassName="text-black-400 text-[12px]"
											/>
											{generations
												.filter(
													(g) =>
														g.status !== "created" &&
														g.context.actionNode.id === node.id,
												)
												.sort((a, b) => a.createdAt - b.createdAt)
												.map((generation) => (
													<div
														key={generation.id}
														className="markdown-renderer"
													>
														<GenerationView generation={generation} />
													</div>
												))}
										</Tabs.Content>
									)),
								)}
						</div>
					</Tabs.Root>
				</div>
			</div>
		</div>
	);
}
