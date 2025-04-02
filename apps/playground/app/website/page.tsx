export default function () {
	return (
		<div className="bg-black-900 text-white-800 relative">
			<div className="fixed w-full top-[20px] z-10">
				<div className="max-w-[1280px] mx-auto px-[18px] py-[12px] rounded-[12px] bg-white-800/20">
					<img
						src="https://giselles.ai/_next/static/media/logo.9244a108.svg"
						height="30px"
						className="invert"
						alt="logo"
					/>
				</div>
			</div>
			<div className="pt-[96px] relative">
				<div className="relative z-1 max-w-[1280px] mx-auto">
					<div>
						<p className="font-accent text-[58px] font-[700] text-white-800 tracking-wider">
							AI power without the complexity
						</p>
						<p className="text-white-400 text-[18px]/[22px]">
							Harness global LLMs, build custom AI solutions in minutes not
							months,
							<br />
							and seamlessly integrate with your existing workflow—the
							sophisticated <br />
							AI platform designed for non-technical teams.
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
						backgroundImage: 'url("/download.jpeg")',
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
		</div>
	);
}
