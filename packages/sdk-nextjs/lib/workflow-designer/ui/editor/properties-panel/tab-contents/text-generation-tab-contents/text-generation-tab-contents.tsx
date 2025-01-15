import type { TextGenerationNodeData } from "@/lib/workflow-data";
import { TabsContent } from "../_";
import { TabsContentPrompt } from "./prompt";

export function TextGenerationTabContents({
	node,
}: {
	node: TextGenerationNodeData;
}) {
	return (
		<>
			<TabsContent value="Prompt" className="flex-1">
				<TabsContentPrompt node={node} />
			</TabsContent>
		</>
	);
}
