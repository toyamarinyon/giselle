import { clsx } from "clsx/lite";
import type { ReactNode } from "react";

export function PropertiesPanelContentBox({
	children,
	className,
}: { children: ReactNode; className?: string }) {
	return (
		<div className={clsx("px-[24px] py-[8px]", className)}>{children}</div>
	);
}
