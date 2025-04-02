export default function () {
	return (
		<div className="bg-black-900 text-white-800 relative">
			<div className="fixed w-full z-10 bg-black-900/10 backdrop-blur">
				<div className="px-[32px] py-[16px]">
					<img
						src="https://giselles.ai/_next/static/media/logo.9244a108.svg"
						className="invert h-[30px]"
						alt="logo"
					/>
				</div>
			</div>
			<div className="pt-[120px] relative">
				<div className="relative z-1 max-w-[1280px] mx-auto">
					<div>
						<p className="font-accent text-[50px]/[60px] font-[700] text-white-800 tracking-wider">
							AI power
							<br />
							without the complexity
						</p>
						<p className="text-white-400/80 text-[18px]/[22px] mt-[24px]">
							Design, Review, Integrate to power up your workflow in minutes.
							{/* Harness global LLMs, build custom AI solutions in minutes not
							months,
							<br />
							and seamlessly integrate with your existing workflow—the
							sophisticated <br />
							AI platform designed for non-technical teams. */}
						</p>
					</div>
					<div className="flex gap-[24px] items-center mt-[24px]">
						<a
							href="https://studio.giselles.ai"
							className="px-[24px] py-[10px] bg-white-900 rounded-[4px] text-black-900 border border-white-900"
						>
							Get Started
						</a>
						<a
							href="https://github.com/giselles-ai/giselle"
							className="px-[24px] py-[10px] rounded-[4px] text-white-900  border border-black-400"
						>
							Clone Source
						</a>
					</div>
				</div>
				<div
					className="w-full h-[500px] absolute top-[180px] z-0 "
					style={{
						backgroundImage: 'url("/bg.jpeg")',
						backgroundSize: "cover",
					}}
				/>
			</div>

			<div className="relative z-1 mt-[48px] max-w-[1280px] mx-auto">
				<div className="bg-black-800 rounded-[8px] p-[8px]">
					<div className="bg-black-900 border border-black-300 rounded-[4px] overflow-hidden">
						<div className="flex items-center bg-black-750 divide-x divide-black-300/20 border-b border-black-300/20">
							<div className="flex-1 p-[12px]">
								<div className="tracking-wide mb-[6px]">Design</div>
								<p className="text-[14px]/[16px] text-black-200/60">
									Visually arrange and connect deverse LLM components to create
									your AI workflow.
								</p>
							</div>
							<div className="flex-1 p-[12px]">
								<div className="tracking-wide mb-[6px]">Review</div>
								<p className="text-[14px]/[16px] text-black-200/60">
									Test and refine output with several inputs and real-time
									feedback.
								</p>
							</div>
							<div className="flex-1 p-[12px]">
								<div className="tracking-wide mb-[6px]">Integrate</div>
								<p className="text-[14px]/[16px] text-black-200/60">
									Deploy seamlessly into existing systems with one-click
									implementation.
								</p>
							</div>
						</div>
						<div>
							<img
								src="https://giselles.ai/_next/static/media/giselle-editor-screenshot.f49d797e.svg"
								alt="bg"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="pt-[120px] max-w-[1280px] mx-auto">
				<div className="flex gap-[40px] items-end">
					<div className="flex-1">
						<p className="font-accent text-[40px]/[50px] font-[700] text-white-800 tracking-wider">
							Design App <br />
							Visually.
						</p>
						<p className="text-white-400/80 text-[18px]/[22px] mt-[10px]">
							Transform ideas into reality with intuitive tools
							<br /> that eliminate learning curves.
						</p>
					</div>
					<div className="flex flex-1 gap-[12px]">
						<div className="flex-1">
							<div className="font-bold">Visual Workflow Builder</div>
							<p className="text-white-400/80 text-[16px]/[20px] mt-[4px]">
								Create powerful AI solutions
								<br /> with simple drag-and-drop
							</p>
						</div>
						<div className="flex-1">
							<div className="font-bold">Prompt Editor</div>
							<p className="text-white-400/80 text-[16px]/[20px] mt-[4px]">
								Insert connected node
								<br /> to prompt directly
							</p>
						</div>
					</div>
				</div>

				<div className="bg-black-800 rounded-[8px] p-[8px] h-[400px] mt-[40px] relative overflow-hidden">
					<img
						src="/ui.jpg"
						className="absolute h-[400px] left-[60px] top-[80px]"
						alt="ui"
					/>
					<img
						src="/prompt.jpg"
						className="absolute h-[400px] left-[660px] top-[40px]"
						alt="prompt ui"
					/>
				</div>
			</div>

			<div className="pt-[120px] max-w-[1280px] mx-auto">
				<div className="flex gap-[40px] items-end">
					<div className="flex-1">
						<p className="font-accent text-[40px]/[50px] font-[700] text-white-800 tracking-wider">
							Review App,
							<br />
							Instantly
						</p>
						<p className="text-white-400/80 text-[18px]/[22px] mt-[24px]">
							Test your apps in real-time
							<br /> and ensure everything works perfectly.
						</p>
					</div>
					<div className="flex flex-1 gap-[12px]">
						<div className="flex-1">
							<div className="font-bold">Visual Workflow Builder</div>
							<p className="text-white-400/80 text-[16px]/[20px] mt-[4px]">
								Create powerful AI solutions
								<br /> with simple drag-and-drop
							</p>
						</div>
						<div className="flex-1">
							<div className="font-bold">Prompt Editor</div>
							<p className="text-white-400/80 text-[16px]/[20px] mt-[4px]">
								Insert connected node
								<br /> to prompt directly
							</p>
						</div>
					</div>
				</div>

				<div className="bg-black-800 rounded-[8px] p-[8px] h-[400px] mt-[40px] relative overflow-hidden">
					<img
						src="/preview.png"
						className="absolute h-[400px] left-[60px] top-[80px]"
						alt="ui"
					/>
					<img
						src="/override.jpg"
						className="absolute h-[400px] left-[660px] top-[40px]"
						alt="prompt ui"
					/>
				</div>
			</div>

			<div className="pt-[120px] max-w-[1280px] mx-auto">
				<div>
					<p className="font-accent text-[40px]/[50px] font-[700] text-white-800 tracking-wider">
						Integrate With
						<br />
						GitHub, Perfectly
					</p>
					<p className="text-white-400/80 text-[18px]/[22px] mt-[24px]">
						Connect directly with your development workflow where you already
						work.
						{/* Harness global LLMs, build custom AI solutions in minutes not
							months,
							<br />
							and seamlessly integrate with your existing workflow—the
							sophisticated <br />
							AI platform designed for non-technical teams. */}
					</p>
				</div>
			</div>
		</div>
	);
}
