function TabContentText({
	content,
	onContentChange,
}: {
	content: TextContent;
	onContentChange?: (content: TextContent) => void;
}) {
	return (
		<div className="relative z-10 flex flex-col gap-[2px] h-full">
			<PropertiesPanelContentBox className="h-full flex">
				<textarea
					name="text"
					id="text"
					className="flex-1 text-[14px] bg-[hsla(222,21%,40%,0.3)] rounded-[8px] text-white p-[14px] font-rosart outline-none resize-none  my-[16px]"
					defaultValue={content.text}
					ref={(el) => {
						function handleBlur() {
							if (el?.value != null && content.text !== el.value) {
								onContentChange?.({
									...content,
									text: el.value,
								});
							}
						}
						el?.addEventListener("blur", handleBlur);
						return () => {
							el?.removeEventListener("blur", handleBlur);
						};
					}}
				/>
			</PropertiesPanelContentBox>
		</div>
	);
}
