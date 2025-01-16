import { useCompletion } from "ai/react";
import { type FormEvent, useCallback } from "react";
import type { TextGenerationNodeData } from "../workflow-data";
import { useWorkflowDesigner } from "./workflow-designer-context";

export function useTextGenerationNode(
	node: TextGenerationNodeData,
	options?: {
		onSubmit?: () => void;
	},
) {
	const { data: Workspace, textGenerationApi } = useWorkflowDesigner();

	const { handleSubmit, completion, input, handleInputChange, isLoading } =
		useCompletion({
			api: textGenerationApi,
			initialInput: node.content.prompt,
			body: {
				workflowId: Workspace.id,
				nodeId: node.id,
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
