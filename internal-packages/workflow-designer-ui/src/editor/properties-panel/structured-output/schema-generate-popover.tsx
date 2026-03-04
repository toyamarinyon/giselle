import { Button } from "@giselle-internal/ui/button";
import { Sparkle } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useCallback, useState } from "react";

interface SchemaGeneratePopoverProps {
	isGenerating: boolean;
	onGenerate: (prompt: string) => void;
}

export function SchemaGeneratePopover({
	isGenerating,
	onGenerate,
}: SchemaGeneratePopoverProps) {
	const [prompt, setPrompt] = useState("");
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	const isDisabled = isGenerating || prompt.trim().length === 0;

	const handleGenerate = useCallback(() => {
		const normalizedPrompt = prompt.trim();
		if (!normalizedPrompt || isGenerating) return;
		setIsPopoverOpen(false);
		setPrompt("");
		onGenerate(normalizedPrompt);
	}, [prompt, isGenerating, onGenerate]);

	return (
		<PopoverPrimitive.Root
			open={isPopoverOpen}
			onOpenChange={(open) => {
				setIsPopoverOpen(open);
				if (!open) setPrompt("");
			}}
		>
			<PopoverPrimitive.Trigger asChild>
				<Button
					type="button"
					variant="glass"
					size="large"
					leftIcon={
						<Sparkle
							className={`size-[14px] ${isGenerating ? "animate-spin" : ""}`}
							fill="currentColor"
						/>
					}
					disabled={isGenerating}
				>
					Generate
				</Button>
			</PopoverPrimitive.Trigger>
			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content
					side="top"
					align="start"
					sideOffset={8}
					onWheel={(e) => e.stopPropagation()}
					className="z-50 w-[480px] rounded-[8px] border border-border bg-black-900 p-[16px] shadow-xl"
				>
					<p id="schema-prompt-description" className="text-[13px] text-text mb-[8px]">
						Describe the desired output structure and we'll create a matching
						schema for you. This will replace your current input.
					</p>
					<textarea
						aria-label="JSON schema generation prompt"
						aria-describedby="schema-prompt-description"
						value={prompt}
						onChange={(event) => setPrompt(event.target.value)}
						onKeyDown={(e) => {
							if (
								e.key === "Enter" &&
								(e.metaKey || e.ctrlKey) &&
								!isDisabled
							) {
								e.preventDefault();
								e.stopPropagation();
								handleGenerate();
							}
						}}
						placeholder="e.g. Extract the user's name, email, and a list of purchased items with price and quantity."
						className="w-full min-h-[184px] rounded-[6px] border border-border bg-transparent px-[12px] py-[10px] text-[14px] outline-none focus:outline-none resize-none text-white/80 placeholder:text-white/30"
						rows={7}
					/>
					<div className="flex justify-end mt-[8px]">
						<Button
							type="button"
							variant="solid"
							size="large"
							onClick={handleGenerate}
							disabled={isDisabled}
							className="whitespace-nowrap"
						>
							Create
							<span className="inline-flex items-center gap-[2px] text-[11px] text-white/40 ml-[8px]">
								<kbd className="px-[4px] py-[1px] bg-white/10 rounded-[4px]">
									⌘
								</kbd>
								<kbd className="px-[4px] py-[1px] bg-white/10 rounded-[4px]">
									↵
								</kbd>
							</span>
						</Button>
					</div>
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	);
}
