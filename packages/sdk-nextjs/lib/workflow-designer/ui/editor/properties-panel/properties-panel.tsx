import { isTextGenerationNode } from "@/lib/workflow-data/node/actions/text-generation";
import { useWorkflowDesigner } from "@/lib/workflow-designer/workflow-designer-context";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import clsx from "clsx/lite";
import {
	type ComponentProps,
	type FC,
	type HTMLAttributes,
	type ReactNode,
	useMemo,
} from "react";
import { PanelOpenIcon } from "../../icons/panel-open";
import { TextGenerationNodePropertiesPanel } from "./text-generation-node-properties-panel";
// import { parse, remove } from "../actions";
// import { vercelBlobFileFolder } from "../constants";
// import { ContentTypeIcon } from "../content-type-icon";
// import { useDeveloperMode } from "../contexts/developer-mode";
// import { useExecution } from "../contexts/execution";
// import {
// 	useArtifact,
// 	useGraph,
// 	useNode,
// 	useSelectedNode,
// } from "../contexts/graph";
// import { usePropertiesPanel } from "../contexts/properties-panel";
// import { useToast } from "../contexts/toast";
// import { textGenerationPrompt } from "../lib/prompts";
// import {
// 	createArtifactId,
// 	createConnectionId,
// 	createFileId,
// 	createNodeHandleId,
// 	createNodeId,
// 	formatTimestamp,
// 	isFile,
// 	isFiles,
// 	isText,
// 	isTextGeneration,
// 	pathJoin,
// 	toErrorWithMessage,
// } from "../lib/utils";
// import type {} from "../types";
// import { Block } from "./block";

function PropertiesPanelContentBox({
	children,
	className,
}: { children: ReactNode; className?: string }) {
	return (
		<div className={clsx("px-[24px] py-[8px]", className)}>{children}</div>
	);
}

const Tabs = TabsPrimitive.Root;

function TabsList(props: ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List className="gap-[16px] flex items-center" {...props} />
	);
}
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger: FC<ComponentProps<typeof TabsPrimitive.Trigger>> = ({
	ref,
	className,
	...props
}) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className="font-rosart text-[16px] text-black-70 hover:text-black-30/70 data-[state=active]:text-black-30 py-[6px] px-[2px]"
		{...props}
	/>
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

function DialogOverlay(props: ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			className="fixed inset-0 z-50 bg-black-100/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
			{...props}
		/>
	);
}
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

function DialogContent({
	children,
	...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
	return (
		<DialogPrimitive.DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				className={clsx(
					"fixed left-[50%] top-[50%] z-50",
					"w-[800px] h-[90%] overflow-hidden translate-x-[-50%] translate-y-[-50%]",
					"px-[32px] py-[24px] flex",
					"font-rosart bg-black-100 rounded-[16px] shadow-[0px_0px_3px_0px_hsla(0,_0%,_100%,_0.25)_inset,0px_0px_8px_0px_hsla(0,_0%,_100%,_0.2)]",
					"duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
				)}
				{...props}
			>
				<div className="relative z-10 flex flex-col w-full">{children}</div>
				<div className="absolute z-0 rounded-[16px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent from-[hsla(233,4%,37%,1)] to-[hsla(233,62%,22%,1)]" />
			</DialogPrimitive.Content>
		</DialogPrimitive.DialogPortal>
	);
}
DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogHeader(props: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className="flex flex-col space-y-1.5 text-center sm:text-left"
			{...props}
		/>
	);
}
DialogHeader.displayName = "DialogHeader";

function DialogTitle(props: ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			className="text-lg font-semibold leading-none tracking-tight"
			{...props}
		/>
	);
}

function DialogFooter(props: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className="flex flex-col space-y-1.5 text-center sm:text-left"
			{...props}
		/>
	);
}
DialogFooter.displayName = "DialogHeader";

export function PropertiesPanel() {
	const { data, openPropertiesPanel, setOpenPropertiesPanel } =
		useWorkflowDesigner();
	const selectedNodes = useMemo(
		() =>
			Array.from(data.ui.nodeState)
				.filter(([_, nodeState]) => nodeState.selected)
				.map(([nodeId]) => data.nodes.get(nodeId))
				.filter((node) => node !== undefined),
		[data],
	);
	return (
		<div
			className={clsx(
				"absolute bg-black-100 rounded-[16px] overflow-hidden shadow-[0px_0px_8px_0px_hsla(0,_0%,_100%,_0.2)] top-[0px] right-[20px] mt-[60px]",
				"data-[state=show]:w-[380px] data-[state=show]:bottom-[20px]",
			)}
			data-state={openPropertiesPanel ? "show" : "hidden"}
		>
			<div className="absolute z-0 rounded-[16px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent from-[hsla(233,4%,37%,1)] to-[hsla(233,62%,22%,1)]" />
			{openPropertiesPanel ? (
				selectedNodes.length === 1 &&
				isTextGenerationNode(selectedNodes[0]) && (
					<TextGenerationNodePropertiesPanel node={selectedNodes[0]} />
				)
			) : (
				<div className="relative z-10 flex justify-between items-center">
					<button
						type="button"
						onClick={() => setOpenPropertiesPanel(true)}
						className="p-[16px] group"
					>
						<PanelOpenIcon className="w-[18px] h-[18px] fill-black-70 group-hover:fill-black-30" />
					</button>
				</div>
			)}
		</div>
	);
}
