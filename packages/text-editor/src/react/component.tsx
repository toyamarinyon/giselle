import { type Editor, EditorProvider, useCurrentEditor } from "@tiptap/react";
import clsx from "clsx/lite";
import {
	BoldIcon,
	ItalicIcon,
	List,
	ListOrdered,
	StrikethroughIcon,
} from "lucide-react";
import { Toolbar as ToolbarPrimitive } from "radix-ui";
import type { ReactNode } from "react";
import { extensions } from "../extensions";
import SourceExtension from "./source-extension";

function Toolbar({
	tools,
}: {
	tools?: (editor: Editor) => ReactNode;
}) {
	const { editor } = useCurrentEditor();
	if (!editor) {
		return null;
	}
	return (
		<ToolbarPrimitive.Root
			className={clsx(
				"flex w-full min-w-max rounded-[4px] mb-[4px] items-center",
				"**:data-toolbar-item:w-[28px] **:data-toolbar-item:h-[30px] **:data-toolbar-item:flex **:data-toolbar-item:items-center **:data-toolbar-item:justify-center **:data-toolbar-item:data-[state=on]:bg-black-300/30 **:data-toolbar-item:rounded-[4px] **:data-toolbar-item:data-[state=on]:text-white-900",
				"**:data-toolbar-separator:w-[1px] **:data-toolbar-separator:h-[18px] **:data-toolbar-separator:bg-white-800 **:data-toolbar-separator:mx-[4px]",
			)}
			aria-label="Formatting options"
		>
			<ToolbarPrimitive.ToggleGroup
				type="multiple"
				aria-label="Text formatting"
				className="flex items-center gap-[4px]"
				onValueChange={(value) => {
					console.log(value);
				}}
				value={[
					editor.isActive("bold") ? "bold" : null,
					editor.isActive("italic") ? "italic" : null,
					editor.isActive("strike") ? "strike" : null,
				].filter((item) => item !== null)}
			>
				<ToolbarPrimitive.ToggleItem
					value="bold"
					aria-label="Bold"
					data-toolbar-item
					onClick={() => editor.chain().focus().toggleBold().run()}
					disabled={!editor.can().chain().focus().toggleBold().run()}
				>
					<BoldIcon className="w-[12px]" />
				</ToolbarPrimitive.ToggleItem>
				<ToolbarPrimitive.ToggleItem
					value="italic"
					aria-label="Italic"
					data-toolbar-item
					onClick={() => editor.chain().focus().toggleItalic().run()}
					disabled={!editor.can().chain().focus().toggleItalic().run()}
				>
					<ItalicIcon className="w-[12px]" />
				</ToolbarPrimitive.ToggleItem>
				<ToolbarPrimitive.ToggleItem
					value="strike"
					aria-label="Strike"
					data-toolbar-item
					onClick={() => editor.chain().focus().toggleStrike().run()}
					disabled={!editor.can().chain().focus().toggleStrike().run()}
				>
					<StrikethroughIcon className="w-[12px]" />
				</ToolbarPrimitive.ToggleItem>
			</ToolbarPrimitive.ToggleGroup>
			<ToolbarPrimitive.Separator data-toolbar-separator />
			<ToolbarPrimitive.ToggleGroup
				type="single"
				aria-label="Text formatting"
				className="flex items-center gap-[4px]"
				value={
					editor.isActive("bulletList")
						? "bulletList"
						: editor.isActive("orderedList")
							? "orderedList"
							: ""
				}
			>
				<ToolbarPrimitive.ToggleItem
					value="orderedList"
					aria-label="Ordered list"
					data-toolbar-item
					onClick={() => {
						if (editor.isActive("bulletList")) {
							editor.chain().focus().toggleBulletList().run();
						}
						editor.chain().focus().toggleOrderedList().run();
					}}
					disabled={!editor.can().chain().focus().toggleOrderedList().run()}
				>
					<ListOrdered className="w-[18px]" />
				</ToolbarPrimitive.ToggleItem>

				<ToolbarPrimitive.ToggleItem
					value="bulletList"
					aria-label="Bulleted list"
					data-toolbar-item
					onClick={() => {
						if (editor.isActive("bulletList")) {
							editor.chain().focus().toggleBulletList().run();
						}
						editor.chain().focus().toggleOrderedList().run();
					}}
					disabled={!editor.can().chain().focus().toggleBulletList().run()}
				>
					<List className="w-[18px]" />
				</ToolbarPrimitive.ToggleItem>
			</ToolbarPrimitive.ToggleGroup>
			{tools && (
				<>
					<ToolbarPrimitive.Separator data-toolbar-separator />
					{tools(editor)}
				</>
			)}
		</ToolbarPrimitive.Root>
	);
}

export function TextEditor({
	value,
	onValueChange,
	tools,
}: {
	value?: string;
	onValueChange?: (value: string) => void;
	tools?: (editor: Editor) => ReactNode;
}) {
	return (
		<div className="flex flex-col h-full">
			<EditorProvider
				slotBefore={<Toolbar tools={tools} />}
				extensions={[...extensions, SourceExtension]}
				content={
					value === undefined
						? undefined
						: value === ""
							? undefined
							: JSON.parse(value)
				}
				editorContainerProps={{
					className: "flex-1 overflow-hidden",
				}}
				onUpdate={(p) => {
					onValueChange?.(JSON.stringify(p.editor.getJSON()));
				}}
				immediatelyRender={false}
				editorProps={{
					attributes: {
						class:
							"prompt-editor border-[0.5px] border-white-900 rounded-[8px] p-[16px] h-full overflow-y-auto",
					},
				}}
			/>
		</div>
	);
}
