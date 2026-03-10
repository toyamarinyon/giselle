import { useToasts } from "@giselle-internal/ui/toast";
import {
	type ContentGenerationNode,
	isEndNode,
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
			const nextContent = { ...node.content, output };
			updateNode(node.id, { content: nextContent } as never);
			if (output.format === "text") {
				return;
			}

			const endNode = store.getState().nodes.find((n) => isEndNode(n));
			if (
				endNode === undefined ||
				endNode.content.output.format === "passthrough"
			) {
				return;
			}

			const result = syncEndNodeOutput(
				endNode.content.output,
				node.id,
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
