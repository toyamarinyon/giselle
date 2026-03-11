import type { NodeReference, OutputId } from "@giselles-ai/protocol";
import type { JSONContent } from "@tiptap/core";
import { Node } from "@tiptap/core";

export interface SourceJSONContent extends JSONContent {
	type: "Source";
	attrs: {
		node: NodeReference;
		outputId: OutputId;
		path?: string[];
	};
}

export function createSourceExtensionJSONContent({
	node,
	outputId,
	path,
}: {
	node: NodeReference;
	outputId: OutputId;
	path?: string[];
}) {
	return {
		type: "Source",
		attrs: {
			node,
			outputId,
			path,
		},
	} satisfies SourceJSONContent;
}

export const SourceExtension = Node.create({
	name: "Source",
	group: "inline",
	inline: true,
	atom: true,

	addAttributes() {
		return {
			node: {
				isRequired: true,
			},
			outputId: {
				isRequired: true,
			},
			path: {
				default: undefined,
			},
		};
	},
	renderHTML({ node }) {
		const path = node.attrs.path;
		const pathSuffix = path === undefined ? "" : `:${path.join(".")}`;
		const attrs: Record<string, string> = {
			"data-node-id": node.attrs.node.id,
			"data-output-id": node.attrs.outputId,
		};
		if (path !== undefined) {
			attrs["data-path"] = path.join(".");
		}
		return [
			"span",
			attrs,
			`{{${node.attrs.node.id}:${node.attrs.outputId}${pathSuffix}}}`,
		];
	},
	renderText({ node }) {
		const path = node.attrs.path;
		const pathSuffix = path === undefined ? "" : `:${path.join(".")}`;
		return `{{${node.attrs.node.id}:${node.attrs.outputId}${pathSuffix}}}`;
	},
});
