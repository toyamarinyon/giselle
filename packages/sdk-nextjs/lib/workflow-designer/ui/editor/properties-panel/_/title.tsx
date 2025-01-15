import type { NodeData } from "@/lib/workflow-data";
import clsx from "clsx/lite";
import type { ReactNode } from "react";
import { ContentTypeIcon } from "../../content-type-icon";

export function PropertiesPanelTitle({
	node,
	action,
}: { node: NodeData; action?: ReactNode }) {
	return (
		<div className="bg-black-80 px-[24px] h-[36px] flex items-center justify-between">
			<div className="flex items-center gap-[10px]">
				<div
					data-type={node.type}
					className={clsx(
						"rounded-[2px] flex items-center justify-center px-[4px] py-[4px]",
						"data-[type=action]:bg-[hsla(187,71%,48%,1)]",
						"data-[type=variable]:bg-white",
					)}
				>
					<ContentTypeIcon
						contentType={node.content.type}
						className="w-[14px] h-[14px] fill-black-100"
					/>
				</div>
				<div className="font-avenir text-[16px] text-black-30">{node.name}</div>
			</div>
			{action}
		</div>
	);
}
