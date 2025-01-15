function TabContentGenerateTextResult({
	node,
	onCreateNewTextGenerator,
	onGenerateText,
	onEditPrompt,
}: {
	node: Node;
	onCreateNewTextGenerator?: () => void;
	onGenerateText: () => void;
	onEditPrompt: () => void;
}) {
	const artifact = useArtifact({ creatorNodeId: node.id });
	if (artifact == null || artifact.object.type !== "text") {
		return (
			<div className="grid gap-[12px] text-[12px] text-black-30 px-[24px] pt-[120px] relative z-10 text-center justify-center">
				<div>
					<p className="font-[800] text-black-30 text-[18px]">
						Nothing is generated.
					</p>
					<p className="text-black-70 text-[12px] text-center leading-5 w-[220px]">
						Generate with the current Prompt or adjust the Prompt and the
						results will be displayed.
					</p>
				</div>

				<div className="flex flex-col gap-[4px]">
					<div>
						<button
							type="button"
							className="inline-flex items-center gap-[4px] bg-black hover:bg-white/20 transition-colors px-[4px] text-black-50 hover:text-black-30 rounded"
							onClick={() => {
								onGenerateText();
							}}
						>
							<CornerDownRightIcon className="w-[12px] h-[12px]" />
							Generate with the current Prompt
						</button>
					</div>
					<div>
						<button
							type="button"
							className="inline-flex items-center gap-[4px] bg-black hover:bg-white/20 transition-colors px-[4px] text-black-50 hover:text-black-30 rounded"
							onClick={() => {
								onEditPrompt();
							}}
						>
							<CornerDownRightIcon className="w-[12px] h-[12px]" />
							Adjust the Prompt
						</button>
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className="grid gap-[8px] font-rosart text-[12px] text-black-30 px-[24px] py-[8px] relative z-10">
			<div>{artifact.object.messages.plan}</div>

			{artifact.object.title !== "" && (
				<DialogPrimitive.Root>
					<DialogPrimitive.DialogTrigger>
						<Block size="large">
							<div className="flex items-center gap-[12px]">
								<div className="px-[8px]">
									{artifact.type === "generatedArtifact" ? (
										<DocumentIcon className="w-[20px] h-[20px] fill-black-30 flex-shrink-0" />
									) : (
										<SpinnerIcon className="w-[20px] h-[20px] stroke-black-30 animate-follow-through-spin fill-transparent" />
									)}
								</div>
								<div className="flex flex-col gap-[2px]">
									<div className="text-[14px]">{artifact.object.title}</div>
									<p className="text-black-70">Click to open</p>
								</div>
							</div>
						</Block>
					</DialogPrimitive.DialogTrigger>
					<DialogContent
						// Prevent Tooltip within popover opens automatically due to trigger receiving focus
						// https://github.com/radix-ui/primitives/issues/2248
						onOpenAutoFocus={(event) => {
							event.preventDefault();
						}}
					>
						<div className="sr-only">
							<DialogHeader>
								<DialogTitle>{artifact.object.title}</DialogTitle>
							</DialogHeader>
							<DialogPrimitive.DialogDescription>
								{artifact.object.content}
							</DialogPrimitive.DialogDescription>
						</div>
						<div className="flex-1 overflow-y-auto">
							<Markdown>{artifact.object.content}</Markdown>
						</div>
						{artifact.type === "generatedArtifact" && (
							<DialogFooter className="mt-[10px] flex justify-between">
								<div className="text-[14px] font-bold text-black-70 ">
									Generated {formatTimestamp.toRelativeTime(artifact.createdAt)}
								</div>
								<div className="text-black-30">
									<ClipboardButton
										text={artifact.object.content}
										sizeClassName="w-[16px] h-[16px]"
									/>
								</div>
							</DialogFooter>
						)}
					</DialogContent>
				</DialogPrimitive.Root>
			)}
			<div>{artifact.object.messages.description}</div>

			{artifact.type === "streamArtifact" && (
				<div className="flex gap-[12px]">
					<WilliIcon className="w-[20px] h-[20px] fill-black-40 animate-[pop-pop_1.8s_steps(1)_infinite]" />
					<WilliIcon className="w-[20px] h-[20px] fill-black-40 animate-[pop-pop_1.8s_steps(1)_0.6s_infinite]" />
					<WilliIcon className="w-[20px] h-[20px] fill-black-40 animate-[pop-pop_1.8s_steps(1)_1.2s_infinite]" />
				</div>
			)}

			{artifact.type === "generatedArtifact" && (
				<div className="flex flex-col gap-[8px]">
					<div className="inline-flex items-center gap-[6px] text-black-30/50 font-sans">
						<p className="italic">Generation completed.</p>
						<ClipboardButton
							sizeClassName="w-[12px] h-[12px]"
							text={artifact.id}
							tooltip={`Copy the fingerprint: ${artifact.id}`}
							defaultIcon={<FingerprintIcon className="h-[12px] w-[12px]" />}
						/>
					</div>
					<div>
						<button
							type="button"
							className="inline-flex items-center gap-[4px] bg-black hover:bg-white/20 transition-colors px-[4px] text-black-50 hover:text-black-30 rounded"
							onClick={() => {
								onCreateNewTextGenerator?.();
							}}
						>
							<CornerDownRightIcon className="w-[12px] h-[12px]" />
							Create a new Text Generator with this result as Source
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
