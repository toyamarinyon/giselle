import type { NodeData } from "@/lib/workflow-data";
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
import { PanelCloseIcon } from "../../icons/panel-close";
import { PanelOpenIcon } from "../../icons/panel-open";
import { ContentTypeIcon } from "../content-type-icon";
import { TabsContentPrompt } from "./tab-contents/prompt";
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

const TabsContent: FC<ComponentProps<typeof TabsPrimitive.Content>> = ({
	ref,
	...props
}) => (
	<TabsPrimitive.Content
		ref={ref}
		className="overflow-y-auto overflow-x-hidden"
		{...props}
	/>
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

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

function PropertiesTabList({
	node,
}: {
	node: NodeData;
}) {
	return (
		<TabsList>
			{node.content.type === "textGeneration" && (
				<>
					<TabsTrigger value="Prompt">Prompt</TabsTrigger>
					<TabsTrigger value="Result">Result</TabsTrigger>
				</>
			)}
			{node.content.type === "text" && (
				<TabsTrigger value="Text">Text</TabsTrigger>
			)}
			{/* {node.content.type === "file" && (
								<TabsTrigger value="File">File</TabsTrigger>
							)}
						)} */}
		</TabsList>
	);
}

function PropertiesPanelTitle({ node }: { node: NodeData }) {
	return (
		<div className="bg-black-80 px-[24px] h-[36px] flex items-center justify-between">
			<div className="flex items-center gap-[10px]">
				<div
					data-type={node.type}
					className={clsx(
						"rounded-[2px] flex items-center justify-center px-[4px] py-[4px]",
						"data-[type=action]:bg-[hsla(187,71%,48%,1)]",
						"data-[type=variable]:bg-white",
					)}
				>
					<ContentTypeIcon
						contentType={node.content.type}
						className="w-[14px] h-[14px] fill-black-100"
					/>
				</div>
				<div className="font-avenir text-[16px] text-black-30">{node.name}</div>
			</div>
			{node.content.type === "textGeneration" && (
				<div className="">
					<button
						type="button"
						className="relative z-10 rounded-[8px] shadow-[0px_0px_3px_0px_#FFFFFF40_inset] py-[3px] px-[8px] bg-black-80 text-black-30 font-rosart text-[14px] disabled:bg-black-40"
					>
						Generate
					</button>
				</div>
			)}
		</div>
	);
}

function PropertiesPanelContents({ node }: { node: NodeData }) {
	if (isTextGenerationNode(node)) {
		return (
			<TabsContent value="Prompt" className="flex-1">
				<TabsContentPrompt node={node} />
			</TabsContent>
		);
	}
}

export function PropertiesPanel() {
	const {
		data,
		openPropertiesPanel,
		setOpenPropertiesPanel,
		propertiesTab,
		setPropertiesTab,
	} = useWorkflowDesigner();
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
				<Tabs
					className="h-full overflow-y-hidden flex flex-col"
					value={propertiesTab}
					onValueChange={(v) => setPropertiesTab(v)}
				>
					<div className="relative z-10 flex justify-between items-center pl-[16px] pr-[24px] py-[10px] h-[56px]">
						<button
							type="button"
							onClick={() => setOpenPropertiesPanel(false)}
							className="p-[8px]"
						>
							<PanelCloseIcon className="w-[18px] h-[18px] fill-black-70 hover:fill-black-30" />
						</button>
						{selectedNodes.length === 1 && (
							<PropertiesTabList node={selectedNodes[0]} />
						)}
					</div>

					{selectedNodes.length === 1 && (
						<>
							<PropertiesPanelTitle node={selectedNodes[0]} />
							<PropertiesPanelContents node={selectedNodes[0]} />
						</>
					)}

					{/* {selectedNode && isTextGeneration(selectedNode) && (
						<TabsContent value="Prompt" className="flex-1">
							<TabsContentPrompt
								key={selectedNode.id}
								content={selectedNode.content}
								onContentChange={(content) => {
									dispatch({
										type: "updateNode",
										input: {
											nodeId: selectedNode.id,
											node: {
												...selectedNode,
												content,
											},
										},
									});
								}}
								onRequirementConnect={(sourceNode) => {
									const requirement: NodeHandle = {
										id: createNodeHandleId(),
										label: "Requirement",
									};
									dispatch([
										{
											type: "updateNode",
											input: {
												nodeId: selectedNode.id,
												node: {
													...selectedNode,
													content: {
														...selectedNode.content,
														requirement,
													},
												},
											},
										},
										{
											type: "addConnection",
											input: {
												connection: {
													id: createConnectionId(),
													sourceNodeId: sourceNode.id,
													sourceNodeType: sourceNode.type,
													targetNodeId: selectedNode.id,
													targetNodeType: selectedNode.type,
													targetNodeHandleId: requirement.id,
												},
											},
										},
									]);
								}}
								onRequirementRemove={(sourceNode) => {
									const connection = graph.connections.find(
										(connection) =>
											connection.targetNodeId === selectedNode.id &&
											connection.sourceNodeId === sourceNode.id,
									);
									if (connection === undefined) {
										return;
									}
									dispatch([
										{
											type: "removeConnection",
											input: {
												connectionId: connection.id,
											},
										},
										{
											type: "updateNode",
											input: {
												nodeId: selectedNode.id,
												node: {
													...selectedNode,
													content: {
														...selectedNode.content,
														requirement: undefined,
													},
												},
											},
										},
									]);
								}}
								onSourceConnect={(sourceNode) => {
									const source: NodeHandle = {
										id: createNodeHandleId(),
										label: `Source${selectedNode.content.sources.length + 1}`,
									};
									dispatch([
										{
											type: "updateNode",
											input: {
												nodeId: selectedNode.id,
												node: {
													...selectedNode,
													content: {
														...selectedNode.content,
														sources: [...selectedNode.content.sources, source],
													},
												},
											},
										},
										{
											type: "addConnection",
											input: {
												connection: {
													id: createConnectionId(),
													sourceNodeId: sourceNode.id,
													sourceNodeType: sourceNode.type,
													targetNodeId: selectedNode.id,
													targetNodeType: selectedNode.type,
													targetNodeHandleId: source.id,
												},
											},
										},
									]);
								}}
								onSourceRemove={(sourceNode) => {
									const connection = graph.connections.find(
										(connection) =>
											connection.targetNodeId === selectedNode.id &&
											connection.sourceNodeId === sourceNode.id,
									);
									if (connection === undefined) {
										return;
									}
									dispatch([
										{
											type: "removeConnection",
											input: {
												connectionId: connection.id,
											},
										},
										{
											type: "updateNode",
											input: {
												nodeId: selectedNode.id,
												node: {
													...selectedNode,
													content: {
														...selectedNode.content,
														sources: selectedNode.content.sources.filter(
															(source) =>
																source.id !== connection.targetNodeHandleId,
														),
													},
												},
											},
										},
									]);
								}}
							/>
						</TabsContent>
					)}
					{selectedNode && isText(selectedNode) && (
						<TabsContent value="Text" className="flex-1" key={selectedNode.id}>
							<TabContentText
								content={selectedNode.content}
								onContentChange={(content) => {
									dispatch({
										type: "updateNode",
										input: {
											nodeId: selectedNode.id,
											node: {
												...selectedNode,
												content,
											},
										},
									});
								}}
							/>
						</TabsContent>
					)}
					{selectedNode && isFile(selectedNode) && (
						<TabsContent value="File" className="h-full">
							<TabContentFile
								nodeId={selectedNode.id}
								content={selectedNode.content}
								onContentChange={(content) => {
									dispatch({
										type: "updateNode",
										input: {
											nodeId: selectedNode.id,
											node: {
												...selectedNode,
												content,
											},
										},
									});
								}}
							/>
						</TabsContent>
					)}
					{selectedNode && isFiles(selectedNode) && (
						<TabsContentFiles
							nodeId={selectedNode.id}
							content={selectedNode.content}
							onContentChange={(content) => {
								dispatch({
									type: "updateNode",
									input: {
										nodeId: selectedNode.id,
										node: {
											...selectedNode,
											content,
										},
									},
								});
							}}
						/>
					)}
					{selectedNode && (
						<TabsContent value="Result">
							<TabContentGenerateTextResult
								node={selectedNode}
								onCreateNewTextGenerator={() => {
									const nodeId = createNodeId();
									const handleId = createNodeHandleId();
									dispatch([
										{
											type: "addNode",
											input: {
												node: {
													id: nodeId,
													name: `Untitle node - ${graph.nodes.length + 1}`,
													position: {
														x: selectedNode.position.x + 400,
														y: selectedNode.position.y + 100,
													},
													selected: true,
													type: "action",
													content: {
														type: "textGeneration",
														llm: "anthropic:claude-3-5-sonnet-latest",
														temperature: 0.7,
														topP: 1,
														instruction: "",
														sources: [{ id: handleId, label: "Source1" }],
													},
												},
											},
										},
										{
											type: "addConnection",
											input: {
												connection: {
													id: createConnectionId(),
													sourceNodeId: selectedNode.id,
													sourceNodeType: selectedNode.type,
													targetNodeId: nodeId,
													targetNodeHandleId: handleId,
													targetNodeType: "action",
												},
											},
										},
										{
											type: "updateNode",
											input: {
												nodeId: selectedNode.id,
												node: {
													...selectedNode,
													selected: false,
												},
											},
										},
									]);
									setTab("Prompt");
								}}
								onEditPrompt={() => setTab("Prompt")}
								onGenerateText={() => executeNode(selectedNode.id)}
							/>
						</TabsContent>
					)} */}
				</Tabs>
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
