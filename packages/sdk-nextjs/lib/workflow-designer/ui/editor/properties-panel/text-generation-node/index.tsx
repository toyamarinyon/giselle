import type { TextGenerationNodeData } from "@/lib/workflow-data";
import { useTextGenerationNode } from "../../../../use-text-generation-node";
import { useWorkflowDesigner } from "../../../../workflow-designer-context";
import { WilliIcon } from "../../../icons/willi";
import { PropertiesPanelContentBox } from "../_/content-box";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../_/tabs";
import { PropertiesPanelTitle } from "../_/title";
import { TabsContentPrompt } from "./prompt";

export function TextGenerationNodePropertiesPanel({
	node,
}: {
	node: TextGenerationNodeData;
}) {
	const { setPropertiesTab } = useWorkflowDesigner();
	const {
		prompt,
		handlePromptChange,
		handleGeneratingTextSubmit,
		generatedText,
		isThinking,
	} = useTextGenerationNode(node, {
		onSubmit: () => {
			setPropertiesTab("Result");
		},
	});
	return (
		<Tabs>
			<TabsList>
				<TabsTrigger value="Prompt">Prompt</TabsTrigger>
				<TabsTrigger value="Result">Result</TabsTrigger>
			</TabsList>
			<PropertiesPanelTitle
				node={node}
				action={
					<form onSubmit={handleGeneratingTextSubmit}>
						<button
							type="submit"
							className="relative z-10 rounded-[8px] shadow-[0px_0px_3px_0px_#FFFFFF40_inset] py-[3px] px-[8px] bg-black-80 text-black-30 font-rosart text-[14px] disabled:bg-black-40"
						>
							Generate
						</button>
					</form>
				}
			/>
			<TabsContent value="Prompt">
				<TabsContentPrompt
					node={node}
					prompt={prompt}
					onPromptChange={handlePromptChange}
				/>
			</TabsContent>
			<TabsContent value="Result">
				<PropertiesPanelContentBox>
					{isThinking ? (
						<div className="flex gap-[12px]">
							<WilliIcon className="w-[20px] h-[20px] fill-black-40 animate-[pop-pop_1.8s_steps(1)_infinite]" />
							<WilliIcon className="w-[20px] h-[20px] fill-black-40 animate-[pop-pop_1.8s_steps(1)_0.6s_infinite]" />
							<WilliIcon className="w-[20px] h-[20px] fill-black-40 animate-[pop-pop_1.8s_steps(1)_1.2s_infinite]" />
						</div>
					) : (
						generatedText
					)}
				</PropertiesPanelContentBox>
			</TabsContent>
		</Tabs>
	);
}
