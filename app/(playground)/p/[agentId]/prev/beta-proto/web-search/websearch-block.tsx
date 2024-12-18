import { CopyIcon } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "../components/dialog";
import { CircleCheckIcon } from "../components/icons/circle-check";
import { CircleXIcon } from "../components/icons/circle-x";
import { DocumentIcon } from "../components/icons/document";
import { SpinnerIcon } from "../components/icons/spinner";
import { Block } from "../giselle-node/components/panel/block";
import type { GiselleNode } from "../giselle-node/types";
import { type WebSearch, webSearchItemStatus, webSearchStatus } from "./types";

interface WebSearchBlockProps extends Partial<WebSearch> {
	node: Pick<GiselleNode, "archetype" | "name">;
}

export function WebSearchBlock(props: WebSearchBlockProps) {
	const title = props.name ?? "Searching...";
	const items = props.items ?? [];
	const status = props.status ?? webSearchStatus.pending;
	return (
		<Dialog>
			<DialogTrigger>
				<Block
					title={title}
					icon={
						status === webSearchStatus.completed ? (
							<DocumentIcon className="w-[18px] h-[18px] fill-black-30" />
						) : (
							<SpinnerIcon className="w-[18px] h-[18px] stroke-black-30 animate-follow-through-spin fill-transparent" />
						)
					}
					description={`${props.node.archetype} / ${props.node.name}`}
				/>
			</DialogTrigger>
			<DialogContent>
				<div className="flex flex-col h-full overflow-hidden z-10">
					<DialogTitle
						className="px-[32px] py-[16px] font-rosart text-[22px] text-black--30 drop-shadow-[0px_0px_20px_0px_hsla(207,_100%,_48%,_1)]"
						style={{
							textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)",
						}}
					>
						{title}
					</DialogTitle>
					<div className="border-t border-black-40" />
					<div className="overflow-x-hidden overflow-y-auto flex-1">
						<div className="px-[16px] py-[16px] font-rosart text-[18px] text-black-30">
							<table className="w-full divide-y divide-black-40 font-avenir border-separate border-spacing-[16px] text-left text-black-70 ">
								<colgroup>
									<col width="0%" />
									<col width="100%" />
									<col width="0%" />
								</colgroup>
								<thead className="font-[500] text-[12px]">
									<tr>
										<th>Status</th>
										<th>Content</th>
										<th>Relevance</th>
									</tr>
								</thead>
								<tbody className="">
									{items.map((item) => (
										<tr key={item.id}>
											<td>
												{item.status === webSearchItemStatus.completed ? (
													<CircleCheckIcon className="w-[20px] h-[20px] fill-green" />
												) : item.status === webSearchItemStatus.failed ? (
													<CircleXIcon className="w-[20px] h-[20px] fill-[hsla(11,100%,50%,1)]" />
												) : (
													""
												)}
											</td>
											<td className="text-black-30 max-w-[1px]">
												<p className="font-rosart text-[18px] underline truncate">
													{item.title}
												</p>
												<p className="text-[12px] truncate">{item.url}</p>
											</td>
											<td className="text-green font-[900]">
												{item.status === webSearchStatus.completed &&
													Math.min(
														0.99,
														Number.parseFloat(item.relevance.toFixed(2)),
													)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
					<div className="px-[32px] flex items-center py-[12px] justify-between">
						<p className="text-[14px] font-bold text-black-70">
							Generated by {props.node.archetype}
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}