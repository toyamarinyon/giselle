"use client";

import clsx from "clsx/lite";
import { useCallback, useEffect, useRef, useState } from "react";

export function EditableText({
	value,
	onValueChange,
	onClickToEditMode,
}: {
	value?: string;
	onValueChange?: (value?: string) => void;
	onClickToEditMode?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
	const [edit, setEdit] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (edit) {
			inputRef.current?.select();
			inputRef.current?.focus();
		}
	}, [edit]);

	const updateValue = useCallback(() => {
		if (!inputRef.current) {
			return;
		}
		setEdit(false);
		const currentValue = inputRef.current.value;

		onValueChange?.(currentValue);
		inputRef.current.value = currentValue;
	}, [onValueChange]);

	return (
		<div>
			<input
				type="text"
				className={clsx(
					"w-[200px] py-[2px] px-[4px] rounded-[4px] hidden data-[editing=true]:block",
					"outline-none ring-[1px] ring-primary-900",
					"text-white-900 text-[14px]",
				)}
				ref={inputRef}
				data-editing={edit}
				defaultValue={value}
				onBlur={() => updateValue()}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						updateValue();
					}
				}}
			/>
			<button
				type="button"
				className={clsx(
					"py-[2px] px-[4px] rounded-l-[4px] last:rounded-r-[4px] data-[editing=true]:hidden",
					"hover:bg-white-900/20",
					"text-white-900 text-[14px]",
					"cursor-default",
				)}
				data-editing={edit}
				onClick={(e) => {
					onClickToEditMode?.(e);
					if (e.isDefaultPrevented()) {
						return;
					}
					setEdit(true);
				}}
			>
				{value}
			</button>
		</div>
	);
}
