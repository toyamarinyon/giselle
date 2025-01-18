import type { TextNodeData } from "@/lib/giselle-data";
import { useWorkflowDesigner } from "../../../workflow-designer-context";
import { PropertiesPanelContentBox } from "../_/content-box";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../_/tabs";
import { PropertiesPanelTitle } from "../_/title";

export function TextNodePropertiesPanel({ node }: { node: TextNodeData }) {
	const { updateNodeDataContent } = useWorkflowDesigner();

	return (
		<Tabs>
			<TabsList>
				<TabsTrigger value="Text">Text</TabsTrigger>
			</TabsList>

			<PropertiesPanelTitle node={node} />
			<TabsContent value="Text">
				<PropertiesPanelContentBox className="h-full flex">
					<textarea
						name="text"
						id="text"
						className="flex-1 text-[14px] bg-[hsla(222,21%,40%,0.3)] rounded-[8px] text-white p-[14px] font-rosart outline-none resize-none  my-[16px]"
						defaultValue={node.content.text}
						ref={(ref) => {
							if (ref === null) {
								return;
							}
							function updateText() {
								if (ref === null) {
									return;
								}
								if (node.content.text !== ref.value) {
									updateNodeDataContent(node, {
										text: ref.value,
									});
								}
							}
							function handleBlur() {
								updateText();
							}
							ref.addEventListener("blur", handleBlur);
							return () => {
								updateText();
								ref.removeEventListener("blur", handleBlur);
							};
						}}
					/>
				</PropertiesPanelContentBox>
			</TabsContent>
		</Tabs>
	);
}
