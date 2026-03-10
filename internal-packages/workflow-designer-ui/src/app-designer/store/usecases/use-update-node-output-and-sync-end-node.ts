import { useToasts } from "@giselle-internal/ui/toast";
import {
	type ContentGenerationNode,
	isEndNode,
	type PropertyMapping,
	type TextGenerationContent,
	type TextGenerationNode,
} from "@giselles-ai/protocol";
import { useCallback } from "react";
import { useAppDesignerStoreApi } from "../app-designer-provider";
import { useWorkspaceActions } from "../hooks";
import { syncEndNodeOutput } from "./sync-end-node-output";

export function useUpdateNodeOutputAndSyncEndNode() {
	const store = useAppDesignerStoreApi();
	const { updateNode } = useWorkspaceActions((s) => ({
		updateNode: s.updateNode,
	}));
	const { toast } = useToasts();

	return useCallback(
		(
			node: TextGenerationNode | ContentGenerationNode,
			output: TextGenerationContent["output"],
		) => {
			const current = store.getState().nodes.find((n) => n.id === node.id);
			if (!current) return;
			const nextContent = { ...current.content, output };
			updateNode(node.id, { content: nextContent } as never);
			const endNode = store.getState().nodes.find((n) => isEndNode(n));
			if (
				endNode === undefined ||
				endNode.content.output.format === "passthrough"
			) {
				return;
			}

			const structuredOutput = node.outputs.find(
				(o) => o.accessor === "generated-text",
			);
			if (!structuredOutput) return;

			if (output.format === "text") {
				const isStaleMapping = (m: PropertyMapping) =>
					m.source.nodeId === node.id &&
					m.source.outputId === structuredOutput.id;

				const staleMappings =
					endNode.content.output.mappings.filter(isStaleMapping);

				if (staleMappings.length > 0) {
					const cleanedMappings = endNode.content.output.mappings.filter(
						(m) => !isStaleMapping(m),
					);
					updateNode(endNode.id, {
						content: {
							...endNode.content,
							output: {
								...endNode.content.output,
								mappings: cleanedMappings,
							},
						},
					} as never);

					const paths = staleMappings.map((m) => m.path.join(".")).join(", ");
					toast(
						`End node: mapping for "${paths}" was removed because the source switched to text format`,
						{ type: "warning" },
					);
				}
				
				return;
			}

			const result = syncEndNodeOutput(
				endNode.content.output,
				node.id,
				structuredOutput.id,
				output.schema,
			);
			if (result) {
				updateNode(endNode.id, {
					content: { ...endNode.content, output: result.output },
				} as never);

				if (result.removedMappings.length > 0) {
					const paths = result.removedMappings
						.map((m) => m.path.join("."))
						.join(", ");
					toast(
						`End node: mapping for "${paths}" was removed because the source property no longer exists`,
						{ type: "warning" },
					);
				}
			}
		},
		[store, updateNode, toast],
	);
}
