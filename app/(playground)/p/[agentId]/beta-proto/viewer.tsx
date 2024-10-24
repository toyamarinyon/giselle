import bg from "./bg.png";
import { WilliIcon } from "./components/icons/willi";
import { Header } from "./header";

export function Viewer() {
	return (
		<div
			className="w-full h-screen bg-black-100 flex flex-col"
			style={{
				backgroundImage: `url(${bg.src})`,
				backgroundPositionX: "center",
				backgroundPositionY: "center",
				backgroundSize: "cover",
			}}
		>
			<Header />
			<div className="flex-1 flex flex-col items-center divide-y mx-[20px]">
				<div className="flex items-center h-[40px]">
					<div className="text-black-70 font-[800] text-[18px]">No exist</div>
				</div>
				<div className="flex-1 w-full flex items-center justify-center">
					<div className="flex flex-col items-center gap-[8px]">
						<WilliIcon className="fill-black-70 w-[32px] h-[32px]" />
						<p className="font-[800] text-black-30">
							This has not yet been executed
						</p>
						<p className="text-black-70 text-[12px] text-center leading-5">
							You have not yet executed the node. <br />
							Let's execute the entire thing and create the final output.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}