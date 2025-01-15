import type { NodeData } from "@/lib/workflow-data";
import { clsx } from "clsx/lite";
import { ContentTypeIcon } from "../content-type-icon";

export function NodeHeader({
	name,
	contentType,
}: { name: string; contentType: NodeData["content"]["type"] }) {
	return (
		<div className="flex items-center gap-[8px] px-[12px]">
			<div
				className={clsx(
					"w-[28px] h-[28px] flex items-center justify-center rounded-[4px] shadow-[1px_1px_12px_0px]",
					"group-data-[type=action]:bg-[hsla(187,71%,48%,1)] group-data-[type=action]:shadow-[hsla(182,73%,52%,0.8)]",
					"group-data-[type=variable]:bg-white group-data-[type=variable]:shadow-[hsla(0,0%,93%,0.8)]",
				)}
			>
				<ContentTypeIcon
					contentType={contentType}
					className="w-[18px] h-[18px] fill-black-100"
				/>
			</div>
			<div className="font-rosart text-[16px] text-black-30">{name}</div>
		</div>
	);
}
