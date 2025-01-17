import type { WorkflowRunId } from "@/lib/giselle-data";
import { useState } from "react";

export function useActiveWorkflowRunId() {
	const [activeWorkflowRunId, setActiveWorkflowRunId] = useState<
		WorkflowRunId | undefined
	>();
	return {
		activeWorkflowRunId: activeWorkflowRunId,
		setActiveWorkflowRunId: setActiveWorkflowRunId,
	};
}
