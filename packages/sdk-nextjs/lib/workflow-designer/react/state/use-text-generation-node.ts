import { Data } from "@/lib/giselle-engine/core/handlers/text-generation";
import { useCompletion } from "ai/react";
import { type FormEvent, useCallback } from "react";
import type { TextGenerationNodeData } from "../../../giselle-data";
import { useWorkflowDesigner } from "../workflow-designer-context";

export function useTextGenerationNode(
	node: TextGenerationNodeData,
	options?: {
		onSubmit?: () => void;
	},
) {
	const { data, textGenerationApi, updateNodeDataContent } =
		useWorkflowDesigner();

	const { handleSubmit, completion, input, handleInputChange, isLoading } =
		useCompletion({
			api: textGenerationApi,
			initialInput: node.content.prompt,
			body: Data.parse({
				workspaceId: data.id,
				nodeId: node.id,
			}),
			onFinish: (_, completion) => {
				updateNodeDataContent(node, { generatedText: completion });
			},
		});

	const handleGeneratingTextSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			options?.onSubmit?.();
			handleSubmit(event);
		},
		[handleSubmit, options?.onSubmit],
	);

	return {
		handleGeneratingTextSubmit,
		generatedText: completion,
		prompt: input,
		handlePromptChange: handleInputChange,
		isThinking: isLoading && completion.length === 0,
	};
}
