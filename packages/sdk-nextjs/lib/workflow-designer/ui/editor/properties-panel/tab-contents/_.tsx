import type { NodeData } from "@/lib/workflow-data";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";
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

export function TabsContent({
	ref,
	...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			ref={ref}
			className="overflow-y-auto overflow-x-hidden"
			{...props}
		/>
	);
}
TabsContent.displayName = TabsPrimitive.Content.displayName;
