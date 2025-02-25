import { Node, nodeInputRule } from "@tiptap/core";
import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";

const Component = (props: NodeViewProps) => {
	return (
		<NodeViewWrapper className="inline">
			<span
				contentEditable={false}
				className="text-green-700 gap-[1px] rounded border-[2px] border-green-700 px-1 bg-green-100"
			>
				{props.node.attrs.label}
			</span>
		</NodeViewWrapper>
	);
};

export default Node.create({
	name: "Source",
	group: "inline",
	inline: true,
	addAttributes() {
		return {
			label: {
				default: "",
			},
		};
	},
	renderHTML() {
		return ["span"];
	},
	addNodeView() {
		return ReactNodeViewRenderer(Component);
	},
	addInputRules() {
		return [
			nodeInputRule({
				find: /{{[\w]+}}/,
				type: this.type,
				getAttributes: (match) => {
					const label = match[0].slice(2, -2);
					return { label };
				},
			}),
		];
	},
});
