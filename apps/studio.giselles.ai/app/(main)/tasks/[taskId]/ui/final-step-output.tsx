"use client";

import { Tabs } from "radix-ui";
import { GenerationView } from "../../../../../../../internal-packages/workflow-designer-ui/src/ui/generation-view";
import { ObjectOutputView } from "../../../../../../../internal-packages/workflow-designer-ui/src/ui/object-output-view";
import { OutputActions } from "./output-actions";
import type { UITask } from "./task-data";

function RunningIndicator() {
	return (
		<p className="text-[13px] text-text-muted/70 italic">
			<span
				className="bg-size-[200%_100%] bg-clip-text bg-linear-to-r from-text-muted/70 via-text-muted/35 to-text-muted/70 text-transparent animate-shimmer"
				style={{
					animationDuration: "1s",
					animationTimingFunction: "linear",
				}}
			>
				Running...
			</span>
		</p>
	);
}

export function FinalStepOutput({
	finalStep,
}: {
	finalStep: UITask["finalStep"];
}) {
	switch (finalStep.format) {
		case "object":
			return (
				<div className="mt-8">
					<div className="flex items-center justify-between text-text-muted text-[13px] font-semibold mb-2 w-full">
						<span className="block">Results</span>
					</div>
					{finalStep.finishedStepItemsCount < finalStep.totalStepItemsCount ? (
						<RunningIndicator />
					) : (
						<div className="overflow-hidden rounded-t-xl rounded-b-none bg-blue-muted/5 px-4 py-3">
							<div className="[&_.markdown-renderer]:text-[13px] [&_.markdown-renderer]:leading-[1.7] [&_.markdown-renderer_li]:my-2 [&_*[class*='text-[14px]']]:text-[13px] **:text-inverse/75 [&_*[class*='text-inverse']]:text-inverse/75!">
								<ObjectOutputView output={finalStep.output} />
							</div>
						</div>
					)}
				</div>
			);
		case "passthrough": {
			const outputs = finalStep.outputs;
			const outputCount = outputs.length;
			const singleOutput = outputCount === 1 ? outputs[0] : undefined;
			const defaultTabValue = outputs.at(0)?.generation.id;

			return (
				<div className="mt-8">
					<div className="flex items-center justify-between text-text-muted text-[13px] font-semibold mb-2 w-full">
						<span className="block">
							{outputCount > 1 ? `Results (${outputCount})` : "Results"}
						</span>
					</div>
					{finalStep.finishedStepItemsCount === 0 ? (
						<RunningIndicator />
					) : singleOutput ? (
						<div className="overflow-hidden rounded-t-xl rounded-b-none bg-blue-muted/5 px-4 py-3">
							<div className="flex items-center justify-between mb-2 w-full gap-3">
								<h3 className="text-[14px] font-medium text-inverse truncate">
									{singleOutput.title}
								</h3>
								<OutputActions generation={singleOutput.generation} />
							</div>
							<div className="[&_.markdown-renderer]:text-[13px] [&_.markdown-renderer]:leading-[1.7] [&_.markdown-renderer_li]:my-2 [&_*[class*='text-[14px]']]:text-[13px] **:text-inverse/75 [&_*[class*='text-inverse']]:text-inverse/75!">
								<GenerationView generation={singleOutput.generation} />
							</div>
						</div>
					) : (
						<Tabs.Root defaultValue={defaultTabValue}>
							<Tabs.List className="inline-flex items-center gap-0 rounded-t-xl rounded-b-none max-w-full overflow-x-auto pl-4">
								{outputs.map((output) => (
									<Tabs.Trigger
										key={output.generation.id}
										value={output.generation.id}
										className="rounded-t-lg rounded-b-none px-2.5 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(192,73%,84%)]/30 text-text-muted/70 hover:text-text-muted data-[state=active]:bg-blue-muted/10 data-[state=active]:text-text-muted"
									>
										{output.title}
									</Tabs.Trigger>
								))}
							</Tabs.List>

							{outputs.map((output) => (
								<Tabs.Content
									key={output.generation.id}
									value={output.generation.id}
									className="overflow-hidden rounded-xl bg-blue-muted/10 px-4 py-3"
								>
									<div className="flex items-center justify-between mb-2 w-full gap-3">
										<h3 className="text-[14px] font-medium text-inverse truncate">
											{output.title}
										</h3>
										<OutputActions generation={output.generation} />
									</div>
									<div className="[&_.markdown-renderer]:text-[13px] [&_.markdown-renderer]:leading-[1.7] [&_.markdown-renderer_li]:my-2 [&_*[class*='text-[14px]']]:text-[13px] **:text-inverse/75 [&_*[class*='text-inverse']]:text-inverse/75!">
										<GenerationView generation={output.generation} />
									</div>
								</Tabs.Content>
							))}
						</Tabs.Root>
					)}
				</div>
			);
		}
		default: {
			const _exhaustiveCheck: never = finalStep;
			throw new Error(`Unhandled format: ${_exhaustiveCheck}`);
		}
	}
}
