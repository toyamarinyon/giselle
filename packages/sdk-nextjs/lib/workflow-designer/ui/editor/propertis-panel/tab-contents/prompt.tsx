import type {
	NodeData,
	TextGenerationNodeData,
	TextNodeData,
} from "@/lib/workflow-data";
import type { TextGenerationContent } from "@/lib/workflow-data/node/actions/text-generation";
import {
	useNode,
	useWorkflowDesigner,
} from "@/lib/workflow-designer/workflow-designer-context";
import { textGenerationPrompt } from "@/lib/workflow-engine/core/prompts";
import clsx from "clsx/lite";
import { CheckIcon, TrashIcon, UndoIcon } from "lucide-react";
import {
	type DetailedHTMLProps,
	useCallback,
	useId,
	useMemo,
	useState,
} from "react";
import { Block } from "../../../_/block";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../../../_/select";
import { Slider } from "../../../_/slider";
import { PropertiesPanelCollapsible } from "../_/collapsible";
import { PropertiesPanelContentBox } from "../_/content-box";
import { NodeDropdown } from "./_";

export function TabsContentPrompt({
	node,
}: {
	node: TextGenerationNodeData;
}) {
	const { data, updateNodeDataContent } = useWorkflowDesigner();

	const connectableTextNodes = useMemo(
		() =>
			Array.from(data.nodes)
				.filter(([_, nodeData]) => nodeData.content.type === "text")
				.map(([_, nodeData]) => nodeData as TextNodeData),
		[data],
	);
	const connectableTextGeneratorNodes = useMemo(
		() =>
			Array.from(data.nodes)
				.filter(([_, nodeData]) => nodeData.content.type === "textGeneration")
				.map(([_, nodeData]) => nodeData as TextGenerationNodeData),
		[data],
	);
	const sourceNodes = useMemo(
		() =>
			node.content.sources
				.map((source) => {
					let sourceNode: NodeData | undefined;
					for (const [connectionId, connectionData] of data.connections) {
						if (connectionData.targetNodeHandleId !== source.id) {
							continue;
						}
						sourceNode = data.nodes.get(connectionData.sourceNodeId);
						if (sourceNode !== undefined) {
							break;
						}
					}
					return sourceNode;
				})
				.filter((node) => node !== undefined),
		[data, node.content.sources],
	);
	const requirementNode = useMemo(() => {
		if (node.content.requirement === undefined) {
			return null;
		}
		for (const [connectionId, connectionData] of data.connections) {
			if (connectionData.targetNodeHandleId !== node.content.requirement.id) {
				continue;
			}
			const result = data.nodes.get(connectionData.sourceNodeId);
			if (result !== undefined) {
				return result;
			}
		}
		return null;
	}, [data, node.content.requirement]);
	return (
		<div className="relative z-10 flex flex-col gap-[2px] h-full">
			<PropertiesPanelCollapsible title="LLM" glanceLabel={node.content.llm}>
				<div className="flex flex-col gap-[10px]">
					<div className="grid gap-[8px]">
						<Select
							value={node.content.llm}
							onValueChange={(value) => {
								updateNodeDataContent(node, {
									llm: value as TextGenerationContent["llm"],
								});
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a LLM" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>OpenAI</SelectLabel>
									<SelectItem value="openai:gpt-4o">gpt-4o</SelectItem>
									<SelectItem value="openai:gpt-4o-mini">
										gpt-4o-mini
									</SelectItem>
								</SelectGroup>
								<SelectGroup>
									<SelectLabel>Anthropic </SelectLabel>
									<SelectItem value="anthropic:claude-3-5-sonnet-latest">
										Claude 3.5 Sonnet
									</SelectItem>
								</SelectGroup>
								<SelectGroup>
									<SelectLabel>Google</SelectLabel>
									<SelectItem value="google:gemini-1.5-flash">
										Gemini 1.5 Flash
									</SelectItem>
									<SelectItem value="google:gemini-1.5-pro">
										Gemini 1.5 Pro
									</SelectItem>
									<SelectItem value="google:gemini-2.0-flash-exp">
										Gemini 2.0 Flash Exp
									</SelectItem>
								</SelectGroup>
								{/* {developerMode && (
									<SelectGroup>
										<SelectLabel>Development</SelectLabel>
										<SelectItem value="dev:error">
											Mock(Raise an error)
										</SelectItem>
									</SelectGroup>
								)} */}
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-[8px]">
						<div className="font-rosart text-[16px] text-black-30">
							Parameters
						</div>
						<div className="grid gap-[16px]">
							<Slider
								label="Temperature"
								value={node.content.temperature}
								max={2.0}
								min={0.0}
								step={0.01}
								onChange={(value) => {
									updateNodeDataContent(node, {
										temperature: value,
									});
								}}
							/>
						</div>
						<Slider
							label="Top P"
							value={node.content.topP}
							max={1.0}
							min={0.0}
							step={0.01}
							onChange={(value) => {
								updateNodeDataContent(node, {
									topP: value,
								});
							}}
						/>
					</div>
				</div>
			</PropertiesPanelCollapsible>

			<div className="border-t border-[hsla(222,21%,40%,1)]" />
			<PropertiesPanelCollapsible
				title="Requirement"
				glanceLabel={
					requirementNode === null ? "Not selected" : requirementNode.name
				}
			>
				{requirementNode === null ? (
					<div className="flex items-center gap-[4px]">
						<div className="py-[4px] text-[12px] flex-1">Not selected</div>
						<NodeDropdown
							nodes={[
								...connectableTextNodes,
								...connectableTextGeneratorNodes,
							]}
							onValueChange={(node) => {}}
						/>
					</div>
				) : (
					<Block
						hoverCardContent={
							<div className="flex justify-between space-x-4">
								{requirementNode.content.type === "text" && (
									<div className="line-clamp-5 text-[14px]">
										{requirementNode.content.text}
									</div>
								)}
							</div>
						}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-[8px]">
								<p className="truncate text-[14px] font-rosart">
									{requirementNode.name}
								</p>
							</div>
							<button
								type="button"
								className="group-hover:block hidden p-[2px] hover:bg-black-70 rounded-[4px]"
								onClick={() => {
									// onRequirementRemove?.(requirementNode);
								}}
							>
								<TrashIcon className="w-[16px] h-[16px] text-black-30" />
							</button>
						</div>
					</Block>
				)}
				{/* <div className="mb-[4px]">
					<Select value={requirementNode?.id}>
						<SelectTrigger>
							<SelectValue placeholder="Select a requirement" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Text Generator</SelectLabel>
								{connectableTextGeneratorNodes.map((node) => (
									<SelectItem value={node.id} key={node.id} label={node.name}>
										<p>it's a text generator</p>
									</SelectItem>
								))}
							</SelectGroup>
							<SelectGroup>
								<SelectLabel>Text</SelectLabel>
								{connectableTextNodes.map((node) => (
									<SelectItem value={node.id} key={node.id} label={node.name}>
										<p>{node.content.text}</p>
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div> */}
			</PropertiesPanelCollapsible>

			<div className="border-t border-[hsla(222,21%,40%,1)]" />

			<PropertiesPanelCollapsible
				title="Sources"
				glanceLabel={
					sourceNodes.length < 1
						? "No sources"
						: `${sourceNodes.length} sources selected`
				}
			>
				{sourceNodes.length < 1 ? (
					<div className="flex items-center gap-[4px]">
						<div className="py-[4px] text-[12px] flex-1">Not selected</div>
						<NodeDropdown
							triggerLabel="add"
							nodes={[
								...connectableTextNodes,
								...connectableTextGeneratorNodes,
							]}
							onValueChange={(node) => {
								// onSourceConnect?.(node);
							}}
						/>
					</div>
				) : (
					<div className="grid gap-2">
						{sourceNodes.map((sourceNode) => (
							<Block
								key={sourceNode.id}
								hoverCardContent={
									<div className="flex justify-between space-x-4">
										node type: {sourceNode.content.type}
										{sourceNode.content.type === "text" && (
											<div className="line-clamp-5 text-[14px]">
												{sourceNode.content.text}
											</div>
										)}
									</div>
								}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-[8px]">
										<p className="truncate text-[14px] font-rosart">
											{sourceNode.name}
										</p>
									</div>
									<button
										type="button"
										className="group-hover:block hidden p-[2px] hover:bg-black-70 rounded-[4px]"
										onClick={() => {
											// onSourceRemove?.(sourceNode);
										}}
									>
										<TrashIcon className="w-[16px] h-[16px] text-black-30" />
									</button>
								</div>
							</Block>
						))}

						<div className="flex items-center gap-[4px]">
							<NodeDropdown
								triggerLabel="add"
								nodes={[
									...connectableTextNodes,
									...connectableTextGeneratorNodes,
									// ...connectableFileNodes,
								]}
								onValueChange={(node) => {
									// onSourceConnect?.(node);
								}}
							/>
						</div>
					</div>
				)}
			</PropertiesPanelCollapsible>

			<div className="border-t border-[hsla(222,21%,40%,1)]" />
			<PropertiesPanelCollapsible
				title="System"
				glanceLabel={node.content.system === undefined ? "Default" : "Modified"}
				expandedClassName="flex-1"
			>
				<div className="flex-1 flex flex-col gap-[3px]">
					<p className="text-[11px] text-black-70">
						System prompts combine requirements and guide you through tasks.
						Make changes or click "Revert to Default" anytime.
					</p>
					<SystemPromptTextarea
						className="flex-1"
						defaultValue={node.content.system ?? textGenerationPrompt}
						revertValue={textGenerationPrompt}
						onValueChange={(value) => {
							updateNodeDataContent(node, {
								system: value,
							});
						}}
						onRevertToDefault={() => {
							updateNodeDataContent(node, {
								system: undefined,
							});
						}}
					/>
				</div>
			</PropertiesPanelCollapsible>
			<div className="border-t border-[hsla(222,21%,40%,1)]" />

			<PropertiesPanelContentBox className="flex flex-col gap-[8px] flex-1">
				<label htmlFor="text" className="font-rosart text-[16px] text-black-30">
					Instruction
				</label>
				<textarea
					name="text"
					id="text"
					className="w-full text-[14px] bg-[hsla(222,21%,40%,0.3)] rounded-[8px] text-white p-[14px] font-rosart outline-none resize-none flex-1 mb-[16px]"
					defaultValue={node.content.prompt}
					ref={(ref) => {
						if (ref === null) {
							return;
						}
						function handleBlur() {
							if (ref === null) {
								return;
							}
							if (node.content.prompt !== ref.value) {
								updateNodeDataContent(node, {
									prompt: ref.value,
								});
							}
						}
						ref.addEventListener("blur", handleBlur);
						return () => {
							if (node.content.prompt !== ref.value) {
								updateNodeDataContent(node, {
									prompt: ref.value,
								});
							}
							ref.removeEventListener("blur", handleBlur);
						};
					}}
				/>
			</PropertiesPanelContentBox>

			{/* <div className="grid gap-[8px]">
				<div className="flex justify-between">
					<div className="font-rosart text-[16px] text-black-30">
						Requirement
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger />
						<DropdownMenuContent>
							<DropdownMenuRadioGroup value={requirementNode?.id}>
								<DropdownMenuLabel>Text Generator</DropdownMenuLabel>
								{connectableTextGeneratorNodes.map((node) => (
									<DropdownMenuRadioItem value={node.id} key={node.id}>
										{node.name}
									</DropdownMenuRadioItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuLabel>Text</DropdownMenuLabel>
								{connectableTextNodes.map((node) => (
									<DropdownMenuRadioItem value={node.id} key={node.id}>
										{node.name}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				{requirementNode === null ? (
					<div className="text-[12px] text-black-40 h-[36px]">
						This prompt has no requirement.
					</div>
				) : (
					// <Block
					// 	icon={
					// 		<ContentTypeIcon
					// 			contentType={requirementNode.content.type}
					// 			className="fill-white"
					// 		/>
					// 	}
					// 	title={requirementNode.name}
					// />
					<NodeBlock node={requirementNode} />
				)}
			</div>

			<div className="border-t border-[hsla(222,21%,40%,1)]" />

			<div className="grid gap-[8px]">
				<div className="flex justify-between">
					<div className="font-rosart text-[16px] text-black-30">Sources</div>
					<DropdownMenu>
						<DropdownMenuTrigger />
						<DropdownMenuContent>
							<DropdownMenuLabel>Text Generator</DropdownMenuLabel>
							{connectableTextGeneratorNodes.map((node) => (
								<DropdownMenuCheckboxItem
									checked={sourceNodes.some((source) => source.id === node.id)}
									key={node.id}
								>
									{node.name}
								</DropdownMenuCheckboxItem>
							))}
							<DropdownMenuSeparator />
							<DropdownMenuLabel>Text</DropdownMenuLabel>
							{connectableTextNodes.map((node) => (
								<DropdownMenuCheckboxItem
									checked={sourceNodes.some((source) => source.id === node.id)}
									key={node.id}
								>
									{node.name}
								</DropdownMenuCheckboxItem>
							))}
							<DropdownMenuSeparator />
							<DropdownMenuLabel>File</DropdownMenuLabel>
							{connectableFileNodes.map((node) => (
								<DropdownMenuCheckboxItem
									checked={sourceNodes.some((source) => source.id === node.id)}
									key={node.id}
								>
									{node.name}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div> */}
			{/* <div className="grid gap-[8px]">
								<div className="flex justify-between">
									<div className="font-rosart text-[16px] text-black-30">
										Sources
									</div>
									<div className="flex items-center gap-[4px]">
										<AddSourceDialog node={node} />
										<Popover.Root>
											<Popover.Trigger asChild>
												<button type="button">
													<CirclePlusIcon
														size={20}
														className="stroke-black-100 fill-black-30"
													/>
												</button>
											</Popover.Trigger>
											<Popover.Content
												side={"top"}
												align="end"
												className="rounded-[16px] p-[8px] text-[14px] w-[200px] text-black-30 bg-black-100 border border-[hsla(222,21%,40%,1)] shadow-[0px_0px_2px_0px_hsla(0,_0%,_100%,_0.1)_inset] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
												sideOffset={5}
											>
												<div className="px-[8px]">
													<div>
														{availableArtifactsOrWebSearches.map(
															(artifactOrWebSearch) =>
																artifactOrWebSearch.object === "artifact" ? (
																	<button
																		type="button"
																		className="flex justify-between items-center py-[4px] w-full"
																		key={artifactOrWebSearch.id}
																		onClick={handleArtifactClick(
																			artifactOrWebSearch,
																		)}
																	>
																		<p className="line-clamp-1 text-left">
																			{artifactOrWebSearch.title}
																		</p>
																		{sources.some(
																			(source) =>
																				source.id === artifactOrWebSearch.id,
																		) && (
																			<CheckIcon
																				size={16}
																				className="stroke-white flex-shrink-0"
																			/>
																		)}
																	</button>
																) : (
																	<button
																		type="button"
																		className="flex justify-between items-center py-[4px] w-full"
																		key={artifactOrWebSearch.id}
																		onClick={handleWebSearchClick(
																			artifactOrWebSearch,
																		)}
																	>
																		<p className="line-clamp-1 text-left">
																			{artifactOrWebSearch.name}
																		</p>
																		{sources.some(
																			(source) =>
																				source.id === artifactOrWebSearch.id,
																		) && (
																			<CheckIcon
																				size={16}
																				className="stroke-white flex-shrink-0"
																			/>
																		)}
																	</button>
																),
														)}
													</div>
												</div>
											</Popover.Content>
										</Popover.Root>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									{sources.map((source) =>
										source.object === "artifact" ? (
											<ArtifactBlock
												key={source.id}
												title={source.title}
												node={source.generatorNode}
												content={source.content}
												completed={true}
											/>
										) : source.object === "file" ? (
											<Block
												key={source.id}
												title={source.name}
												description={
													source.status === "uploading"
														? "Uploading..."
														: source.status === "processing"
															? "Processing..."
															: source.status === "processed"
																? "Ready"
																: "Pending"
												}
												icon={
													<DocumentIcon className="w-[18px] h-[18px] fill-black-30 flex-shrink-0" />
												}
											/>
										) : source.object === "webSearch" ? (
											<Block
												key={source.id}
												title={source.name}
												icon={
													<TextsIcon className="w-[18px] h-[18px] fill-black-30 flex-shrink-0" />
												}
											/>
										) : (
											<Block
												key={source.id}
												title={source.title}
												icon={
													<TextsIcon className="w-[18px] h-[18px] fill-black-30 flex-shrink-0" />
												}
												onDelete={removeTextContent({ id: source.id })}
											/>
										),
									)}
								</div>
							</div> */}
		</div>
	);
}

interface SystemPromptTextareaProps
	extends Pick<
		DetailedHTMLProps<
			React.TextareaHTMLAttributes<HTMLTextAreaElement>,
			HTMLTextAreaElement
		>,
		"defaultValue" | "className"
	> {
	onValueChange?: (value: string) => void;
	onRevertToDefault?: () => void;
	revertValue?: string;
}
export function SystemPromptTextarea({
	defaultValue,
	className,
	onValueChange,
	onRevertToDefault,
	revertValue,
}: SystemPromptTextareaProps) {
	const id = useId();
	return (
		<div className={clsx("relative", className)}>
			<textarea
				className="w-full text-[14px] bg-[hsla(222,21%,40%,0.3)] rounded-[8px] text-white p-[14px] font-rosart outline-none resize-none h-full"
				defaultValue={defaultValue}
				ref={(ref) => {
					if (ref === null) {
						return;
					}
					ref.dataset.refId = id;

					function handleBlur() {
						if (ref === null) {
							return;
						}
						if (defaultValue !== ref.value) {
							onValueChange?.(ref.value);
						}
					}
					ref.addEventListener("blur", handleBlur);
					return () => {
						ref.removeEventListener("blur", handleBlur);
					};
				}}
			/>

			<div className="absolute bottom-[4px] right-[4px]">
				<RevertToDefaultButton
					onClick={() => {
						onRevertToDefault?.();
						const textarea = document.querySelector(
							`textarea[data-ref-id="${id}"]`,
						);
						if (
							revertValue !== undefined &&
							textarea !== null &&
							textarea instanceof HTMLTextAreaElement
						) {
							textarea.value = revertValue;
						}
					}}
				/>
			</div>
		</div>
	);
}

function RevertToDefaultButton({ onClick }: { onClick: () => void }) {
	const [clicked, setClicked] = useState(false);

	const handleClick = useCallback(() => {
		onClick();
		setClicked(true);
		setTimeout(() => setClicked(false), 2000);
	}, [onClick]);

	return (
		<button
			type="button"
			className="group flex items-center bg-black-100/30 text-white px-[8px] py-[2px] rounded-md transition-all duration-300 ease-in-out hover:bg-black-100"
			onClick={handleClick}
		>
			<div className="relative h-[12px] w-[12px]">
				<span
					className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${clicked ? "opacity-0" : "opacity-100"}`}
				>
					<UndoIcon className="h-[12px] w-[12px]" />
				</span>
				<span
					className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${clicked ? "opacity-100" : "opacity-0"}`}
				>
					<CheckIcon className="h-[12px] w-[12px]" />
				</span>
			</div>
			<div
				className="overflow-hidden transition-all duration-300 ease-in-out w-0 data-[clicked=false]:group-hover:w-[98px] data-[clicked=true]:group-hover:w-[40px] group-hover:ml-[4px] flex"
				data-clicked={clicked}
			>
				<span className="whitespace-nowrap text-[12px]">
					{clicked ? "Revert!" : "Revert to Default"}
				</span>
			</div>
		</button>
	);
}
