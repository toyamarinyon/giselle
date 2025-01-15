import type { TextGenerationNodeData } from "@/lib/workflow-data";
import { useTextGenerationNode } from "../../../../use-text-generation-node";
import { useWorkflowDesigner } from "../../../../workflow-designer-context";
import { TabsContent } from "../_/tab-conent";
import { PropertiesPanelTitle } from "../_/title";
import { TabsContentPrompt } from "./prompt";

export function TextGenerationNodePropertiesPanel({
	node,
}: {
	node: TextGenerationNodeData;
}) {
	const { setPropertiesTab } = useWorkflowDesigner();
	const { prompt, handlePromptChange, handleGeneratingTextSubmit } =
		useTextGenerationNode(node, {
			onSubmit: () => {
				setPropertiesTab("Result");
			},
		});
	return (
		<>
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
			<TabsContent value="Prompt" className="flex-1">
				<TabsContentPrompt
					node={node}
					prompt={prompt}
					onPromptChange={handlePromptChange}
				/>
			</TabsContent>
		</>
	);
}
