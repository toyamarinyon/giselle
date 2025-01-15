import type { NodeData } from "@/lib/workflow-data";
import clsx from "clsx/lite";
import { CheckIcon, UndoIcon } from "lucide-react";
import { type DetailedHTMLProps, useCallback, useId, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../../_/dropdown-menu";

export function NodeDropdown({
	triggerLabel,
	nodes,
	onValueChange,
}: {
	triggerLabel?: string;
	nodes: NodeData[];
	onValueChange?: (node: NodeData) => void;
}) {
	const textGenerationNodes = nodes.filter(
		(node) => node.content.type === "textGeneration",
	);
	const textNodes = nodes.filter((node) => node.content.type === "text");
	// const fileNodes = nodes.filter((node) => node.content.type === "files");

	const handleValueChange = (value: string) => {
		if (!onValueChange) return;

		const node = nodes.find((node) => node.id === value);
		if (node === undefined) return;

		onValueChange(node);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="text-[12px] px-[8px] py-[0.5px] border border-black-50 rounded-[4px]">
				{triggerLabel ?? "Select"}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" sideOffset={6}>
				<DropdownMenuRadioGroup onValueChange={handleValueChange}>
					<DropdownMenuLabel>Text Generator</DropdownMenuLabel>
					{textGenerationNodes.map((node) => (
						<DropdownMenuRadioItem value={node.id} key={node.id}>
							{node.name}
						</DropdownMenuRadioItem>
					))}
					{textNodes.length > 0 && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuLabel>Text</DropdownMenuLabel>
							{textNodes.map((node) => (
								<DropdownMenuRadioItem value={node.id} key={node.id}>
									{node.name}
								</DropdownMenuRadioItem>
							))}
						</>
					)}
					{/* {fileNodes.length > 0 && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuLabel>File</DropdownMenuLabel>
							{fileNodes.map((node) => (
								<DropdownMenuRadioItem value={node.id} key={node.id}>
									{node.name}
								</DropdownMenuRadioItem>
							))}
						</>
					)} */}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
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
