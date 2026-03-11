import { useToasts } from "@giselle-internal/ui/toast";
import {
	type ContentGenerationNode,
	isEndNode,
	type Schema,
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

			const sourceSchema: Schema =
				output.format === "text"
					? {
							title: "",
							type: "object",
							properties: {},
							additionalProperties: false,
							required: [],
						}
					: output.schema;

			const result = syncEndNodeOutput(
				endNode.content.output,
				node.id,
				structuredOutput.id,
				sourceSchema,
			);
			if (result) {
				updateNode(endNode.id, {
					content: { ...endNode.content, output: result.output },
				} as never);

				if (result.removedMappings.length > 0) {
					const paths = result.removedMappings
						.map((m) => m.path.join("."))
						.join(", ");
					const reason =
						output.format === "text"
							? "the source switched to text format"
							: "the source property no longer exists";
					toast(
						`End node: mapping for "${paths}" was removed because ${reason}`,
						{
							type: "warning",
						},
					);
				}
			}
		},
		[store, updateNode, toast],
	);
}
