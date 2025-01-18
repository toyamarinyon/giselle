import Link from "next/link";
import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";
import type { ViewState } from "../../state";
import { GiselleLogo } from "../icons/giselle-logo";
import { SparklesIcon } from "../icons/sparkles";
import { useWorkflowDesigner } from "../workflow-designer-context";

function Button({
	className,
	...props
}: DetailedHTMLProps<
	ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
>) {
	return (
		<button
			className="px-[16px] py-[8px] rounded-[8px] flex items-center gap-[2px] bg-[hsla(207,19%,77%,0.3)] font-rosart text-white"
			style={{
				boxShadow: "0px 0px 3px 0px hsla(0, 0%, 100%, 0.25) inset",
			}}
			{...props}
		/>
	);
}

function SelectionIndicator() {
	return (
		<svg
			width="70"
			height="32"
			viewBox="0 0 70 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Selection Indicator</title>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M67.1402 12.1274C66.9421 12.4761 66.7105 12.8341 66.4438 13.2011C65.1133 15.0319 62.9944 16.9585 60.173 18.8432C54.5383 22.6072 46.3748 26.0225 37.0232 28.1281C36.7764 28.1837 36.53 28.238 36.2841 28.2912C35.9438 28.2992 35.602 28.3053 35.259 28.3094C25.7364 28.4229 17.1525 26.9771 10.9859 24.6019C7.89837 23.4127 5.49151 22.019 3.87301 20.5357C3.55344 20.2428 3.26861 19.9504 3.01705 19.6591C3.23284 19.2627 3.49226 18.8542 3.79778 18.4338C5.12826 16.603 7.2472 14.6764 10.0685 12.7917C15.7032 9.02772 23.8668 5.6124 33.2183 3.50685C33.5357 3.4354 33.8522 3.36595 34.1678 3.29849C34.3585 3.29497 34.5495 3.29207 34.741 3.28979C44.2635 3.17628 52.8475 4.62209 59.0141 6.9973C62.1016 8.18652 64.5085 9.58017 66.127 11.0635C66.5151 11.4192 66.852 11.7741 67.1402 12.1274ZM68.0138 13.4742C64.5805 18.7398 55.682 24.1517 44.2965 27.7203C50.1314 27.0137 55.3006 25.7153 59.3667 24.0252C62.4034 22.763 64.7514 21.3127 66.3077 19.7915C67.8608 18.2733 68.5276 16.7899 68.4989 15.4003C68.4859 14.7721 68.33 14.1281 68.0138 13.4742ZM36.4479 29.7878C55.2361 29.3192 70.1557 22.9646 69.9988 15.3824C69.9741 14.1916 69.579 13.0398 68.8575 11.9442C69.4501 10.6239 69.6744 9.3254 69.482 8.08082C68.3259 0.599797 52.5477 -2.14952 34.0078 1.80124C15.0058 2.17748 -0.157012 8.57345 0.00122734 16.2168C0.0276145 17.4913 0.478388 18.7211 1.29942 19.8851C0.770428 21.1384 0.576644 22.3707 0.75953 23.5541C1.92009 31.0639 17.8155 33.8055 36.4479 29.7878ZM28.3757 29.6186C16.4759 28.8081 6.69877 25.564 2.38267 21.1723C2.17159 21.9076 2.12519 22.5923 2.2229 23.2246C2.43309 24.5848 3.33787 25.8811 5.12281 27.0079C6.91063 28.1365 9.46253 29.0115 12.6571 29.5417C17.0099 30.2641 22.4122 30.3228 28.3757 29.6186ZM2.10372 18.3548C1.70844 17.6219 1.51565 16.9006 1.50112 16.1989C1.47235 14.8093 2.13917 13.3259 3.69231 11.8077C5.24861 10.2865 7.5966 8.8362 10.6333 7.57399C14.8317 5.82891 20.2063 4.50135 26.2755 3.81179C14.5914 7.42214 5.47462 12.9776 2.10372 18.3548ZM41.9658 2.00462C47.8897 1.31276 53.256 1.37486 57.5845 2.09323C60.779 2.62339 63.3309 3.49837 65.1188 4.62703C66.9037 5.75386 67.8085 7.05015 68.0187 8.41031C68.1236 9.0894 68.0623 9.82899 67.8093 10.6269C63.6361 6.17621 53.8903 2.86638 41.9658 2.00462Z"
				fill="#BAC6D0"
			/>
		</svg>
	);
}

interface ViewSwitchProps {
	children: ReactNode;
	view: ViewState;
	selected?: boolean;
}
function ViewSwitch(props: ViewSwitchProps) {
	const { view, setView } = useWorkflowDesigner();
	return (
		<button
			type="button"
			className="px-[16px] uppercase font-bold text-[14px] relative text-white"
			onClick={() => setView(props.view)}
		>
			{props.children}
			{view === props.view && (
				<div className="absolute left-0 -top-[6px]">
					<SelectionIndicator />
				</div>
			)}
		</button>
	);
}

export function Header() {
	const { data } = useWorkflowDesigner();
	return (
		<div className="h-[60px] flex items-center justify-between mx-[20px]">
			<div className="flex gap-[8px] items-center flex-1">
				<Link href="/">
					<GiselleLogo className="fill-white w-[70px] h-auto mt-[6px]" />
				</Link>
				<div className="font-rosart text-[18px] text-black--30">Playground</div>
			</div>
			<div className="flex items-center gap-[10px] flex-1 justify-center">
				<ViewSwitch view="editor">edit</ViewSwitch>
				<ViewSwitch view="viewer">view</ViewSwitch>
			</div>
			<div className="flex-1 flex justify-end">
				<Button
					type="button"
					// onClick={() => {
					// 	executeFlow(graph.flows[0].id);
					// }}
				>
					<SparklesIcon className="w-[18px] h-[18px] fill-white drop-shadow-[0.66px_1.32px_2.64px_hsla(0,0%,100%,0.25)]" />
					<span>Run</span>
				</Button>
			</div>
		</div>
	);
}
