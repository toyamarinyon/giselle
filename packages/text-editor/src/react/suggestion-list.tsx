import type { NodeLike, Output } from "@giselles-ai/protocol";
import type { SuggestionProps } from "@tiptap/suggestion";
import clsx from "clsx/lite";
import { Braces, Hash, List, ToggleLeft, Type } from "lucide-react";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState,
} from "react";

// TODO: Consolidate with workflow-designer-ui field-type-config.tsx
const fieldTypeConfig = {
	string: {
		label: "STR",
		icon: <Type className="size-[14px]" />,
		colorClass: "text-emerald-300",
	},
	number: {
		label: "NUM",
		icon: <Hash className="size-[14px]" />,
		colorClass: "text-teal-300",
	},
	boolean: {
		label: "BOOL",
		icon: <ToggleLeft className="size-[14px]" />,
		colorClass: "text-rose-400",
	},
	object: {
		label: "OBJ",
		icon: <Braces className="size-[14px]" />,
		colorClass: "text-blue-300",
	},
	array: {
		label: "ARR",
		icon: <List className="size-[14px]" />,
		colorClass: "text-indigo-300",
	},
} as const satisfies Record<
	string,
	{ label: string; icon: React.ReactNode; colorClass: string }
>;

type FieldType = keyof typeof fieldTypeConfig;

export interface SuggestionItem {
	id: string;
	node: NodeLike;
	output: Output;
	label: string;
	path?: string[];
	fieldType?: FieldType;
}
interface SuggestionListProps extends SuggestionProps<SuggestionItem> {}
export interface SuggestionListRef {
	onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SuggestionList = forwardRef<
	SuggestionListRef,
	SuggestionListProps
>(({ items, command }, ref) => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	useEffect(() => {
		if (items.length >= 0) {
			setSelectedIndex(0);
		}
	}, [items.length]);
	const selectItem = useCallback(
		(index: number) => {
			const item = items[index];
			if (item) {
				command(item);
			}
		},
		[items, command],
	);

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }) => {
			if (items.length === 0) {
				return false;
			}

			if (event.key === "ArrowUp") {
				setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
				return true;
			}
			if (event.key === "ArrowDown") {
				setSelectedIndex((prev) => (prev + 1) % items.length);
				return true;
			}

			if (event.key === "Enter") {
				selectItem(selectedIndex);
				return true;
			}

			return false;
		},
	}));

	if (items.length === 0) {
		return null;
	}

	return (
		<div
			className={clsx(
				"rounded-[8px] bg-(image:--glass-bg)",
				"p-[4px] border border-glass-border/20 backdrop-blur-md shadow-xl",
				"after:absolute after:bg-(image:--glass-highlight-bg) after:left-4 after:right-4 after:h-px after:top-0",
				"w-fit",
			)}
		>
			{items.map(({ id, path, label, fieldType }, index) => {
				const config =
					fieldType !== undefined ? fieldTypeConfig[fieldType] : undefined;
				return (
					<button
						type="button"
						key={id}
						onClick={() => selectItem(index)}
						className={clsx(
							"flex items-center gap-[16px] w-full text-left px-[12px] py-[6px]",
							"text-[14px] text-text",
							"rounded-[4px]",
							"outline-none cursor-pointer",
							"transition-colors",
							selectedIndex === index
								? "bg-ghost-element-hover"
								: "hover:bg-ghost-element-hover/25",
						)}
						style={
							path !== undefined && path.length > 0
								? { paddingLeft: `${12 + path.length * 30}px` }
								: undefined
						}
					>
						{config && (
							<span className={`shrink-0 ${config.colorClass}`}>
								{config.icon}
							</span>
						)}
						<span className="flex-1">{label}</span>
						{config && (
							<span
								className={`shrink-0 text-[10px] font-bold ${config.colorClass}`}
							>
								{config.label}
							</span>
						)}
					</button>
				);
			})}
		</div>
	);
});

SuggestionList.displayName = "SuggestionList";
