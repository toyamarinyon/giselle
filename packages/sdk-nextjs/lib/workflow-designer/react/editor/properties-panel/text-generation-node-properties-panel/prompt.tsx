import {
	type NodeData,
	type TextGenerationNodeData,
	type TextNodeData,
	createConnectionHandle,
} from "@/lib/giselle-data";
import { textGenerationPrompt } from "@/lib/giselle-engine/core/prompts";
import clsx from "clsx/lite";
import { CheckIcon, TrashIcon, UndoIcon } from "lucide-react";
import {
	type ChangeEvent,
	type DetailedHTMLProps,
	useCallback,
	useId,
	useMemo,
	useState,
} from "react";
import { Block } from "../../../ui/block";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../../../ui/select";
import { Slider } from "../../../ui/slider";
import { useWorkflowDesigner } from "../../../workflow-designer-context";
import { PropertiesPanelCollapsible } from "../_/collapsible";
import { PropertiesPanelContentBox } from "../_/content-box";
import { NodeDropdown } from "../_/node-dropdown";

export function TabsContentPrompt({
	node,
	prompt,
	onPromptChange,
}: {
	node: TextGenerationNodeData;
	prompt: string;
	onPromptChange: (
		event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
	) => void;
}) {
	const { data, updateNodeDataContent, addConnection, deleteConnection } =
		useWorkflowDesigner();

	const addSource = useCallback(
		(sourceNode: NodeData) => {
			const connectionHandle = createConnectionHandle({
				label: "Source",
				nodeId: node.id,
				nodeType: node.type,
				connectedNodeId: sourceNode.id,
			});
			addConnection(sourceNode, connectionHandle);
			connectionHandle;
			updateNodeDataContent(node, {
				sources: [...node.content.sources, connectionHandle],
			});
		},
		[addConnection, node, updateNodeDataContent],
	);

	const removeSource = useCallback(
		(removeSourceNode: NodeData) => {
			for (const [connectionId, connectionData] of data.connectionMap) {
				if (
					connectionData.sourceNodeId !== removeSourceNode.id ||
					connectionData.targetNodeId !== node.id
				) {
					continue;
				}
				deleteConnection(connectionId);
				updateNodeDataContent(node, {
					sources: node.content.sources.filter(
						({ id }) => id !== connectionData.targetNodeHandleId,
					),
				});
				break;
			}
		},
		[deleteConnection, data, node, updateNodeDataContent],
	);

	const setRequirement = useCallback(
		(requirementNode: NodeData) => {
			const connectionHandle = createConnectionHandle({
				label: "Requirement",
				nodeId: node.id,
				nodeType: node.type,
				connectedNodeId: requirementNode.id,
			});
			addConnection(requirementNode, connectionHandle);
			updateNodeDataContent(node, {
				requirement: connectionHandle,
			});
		},
		[addConnection, node, updateNodeDataContent],
	);

	const unsetRequirement = useCallback(() => {
		const requirementConnectionHandle = node.content.requirement;
		if (requirementConnectionHandle === undefined) {
			return;
		}
		for (const [connectionId, connectionData] of data.connectionMap) {
			if (
				connectionData.targetNodeHandleId !== requirementConnectionHandle.id
			) {
				continue;
			}
			deleteConnection(connectionId);
			break;
		}
		updateNodeDataContent(node, {
			requirement: undefined,
		});
	}, [deleteConnection, data, node, updateNodeDataContent]);

	const connectableTextNodes = useMemo(
		() =>
			Array.from(data.nodeMap)
				.filter(([_, nodeData]) => nodeData.content.type === "text")
				.map(([_, nodeData]) => nodeData as TextNodeData),
		[data],
	);
	const connectableTextGeneratorNodes = useMemo(
		() =>
			Array.from(data.nodeMap)
				.filter(([_, nodeData]) => nodeData.content.type === "textGeneration")
				.map(([_, nodeData]) => nodeData as TextGenerationNodeData),
		[data],
	);
	const sourceNodes = useMemo(
		() =>
			node.content.sources
				.map((source) => {
					let sourceNode: NodeData | undefined;
					for (const [connectionId, connectionData] of data.connectionMap) {
						if (connectionData.targetNodeHandleId !== source.id) {
							continue;
						}
						sourceNode = data.nodeMap.get(connectionData.sourceNodeId);
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
		for (const [connectionId, connectionData] of data.connectionMap) {
			if (connectionData.targetNodeHandleId !== node.content.requirement.id) {
				continue;
			}
			const result = data.nodeMap.get(connectionData.sourceNodeId);
			if (result !== undefined) {
				return result;
			}
		}
		return null;
	}, [data, node.content.requirement]);
	return (
		<>
			<PropertiesPanelCollapsible title="LLM" glanceLabel={node.content.llm}>
				<div className="flex flex-col gap-[10px]">
					<div className="grid gap-[8px]">
						<Select
							value={node.content.llm}
							onValueChange={(value) => {
								updateNodeDataContent(node, {
									llm: value,
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
							onValueChange={(node) => {
								setRequirement(node);
							}}
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
									unsetRequirement();
								}}
							>
								<TrashIcon className="w-[16px] h-[16px] text-black-30" />
							</button>
						</div>
					</Block>
				)}
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
								addSource(node);
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
											removeSource(sourceNode);
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
									addSource(node);
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
					defaultValue={prompt}
					onChange={onPromptChange}
					ref={(ref) => {
						if (ref === null) {
							return;
						}
						function updatePrompt() {
							if (ref === null) {
								return;
							}
							if (node.content.prompt !== ref.value) {
								updateNodeDataContent(node, {
									prompt: ref.value,
								});
							}
						}
						function handleBlur() {
							updatePrompt();
						}
						ref.addEventListener("blur", handleBlur);
						return () => {
							updatePrompt();
							ref.removeEventListener("blur", handleBlur);
						};
					}}
				/>
			</PropertiesPanelContentBox>
		</>
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
