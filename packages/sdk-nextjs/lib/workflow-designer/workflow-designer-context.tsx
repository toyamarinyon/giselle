"use client";

import {
	createContext,
	useCallback,
	useContext,
	useRef,
	useState,
} from "react";
import type { z } from "zod";
import type { NodeData, WorkflowData } from "../workflow-data";
import type { CreateTextGenerationNodeParams } from "../workflow-data/node/actions/text-generation";
import type {
	ConnectionHandle,
	ConnectionId,
	NodeId,
	NodeUIState,
} from "../workflow-data/node/types";
import type { CreateTextNodeParams } from "../workflow-data/node/variables/text";
import { callSaveWorkflowApi } from "./call-save-workflow-api";
import { usePropertiesPanel, useView } from "./state";
import {
	WorkflowDesigner,
	type WorkflowDesignerOperations,
} from "./workflow-designer";

interface WorkflowDesignerContextValue
	extends Pick<
			WorkflowDesignerOperations,
			| "addTextGenerationNode"
			| "updateNodeData"
			| "addConnection"
			| "addTextNode"
			| "setUiNodeState"
			| "deleteNode"
			| "deleteConnection"
		>,
		ReturnType<typeof usePropertiesPanel>,
		ReturnType<typeof useView> {
	data: WorkflowData;
	textGenerationApi: string;
	updateNodeDataContent: <T extends NodeData>(
		node: T,
		content: Partial<T["content"]>,
	) => void;
}
const WorkflowDesignerContext = createContext<
	WorkflowDesignerContextValue | undefined
>(undefined);

export function WorkflowDesignerProvider({
	children,
	data,
	saveWorkflowApi = "/api/workflow/save-workflow",
	textGenerationApi = "/api/workflow/text-generation",
}: {
	children: React.ReactNode;
	data: WorkflowData;
	saveWorkflowApi?: string;
	textGenerationApi?: string;
}) {
	const workflowDesignerRef = useRef(
		WorkflowDesigner({
			defaultValue: data,
		}),
	);
	const [workflowData, setWorkflowData] = useState(data);
	const persistTimeoutRef = useRef<Timer | null>(null);
	const isPendingPersistRef = useRef(false);

	const saveWorkflowData = useCallback(async () => {
		isPendingPersistRef.current = false;
		try {
			await callSaveWorkflowApi({
				api: saveWorkflowApi,
				workflowId: workflowData.id,
				workflowData,
			});
		} catch (error) {
			console.error("Failed to persist graph:", error);
		}
	}, [saveWorkflowApi, workflowData]);

	const setAndSaveWorkflowData = useCallback(
		(data: WorkflowData) => {
			setWorkflowData(data);

			isPendingPersistRef.current = true;
			if (persistTimeoutRef.current) {
				clearTimeout(persistTimeoutRef.current);
			}
			persistTimeoutRef.current = setTimeout(saveWorkflowData, 500);
		},
		[saveWorkflowData],
	);

	const addTextGenerationNode = useCallback(
		(
			params: z.infer<typeof CreateTextGenerationNodeParams>,
			options?: { ui?: NodeUIState },
		) => {
			if (workflowDesignerRef.current === undefined) {
				return;
			}
			workflowDesignerRef.current.addTextGenerationNode(params, options);
			setAndSaveWorkflowData(workflowDesignerRef.current.getData());
		},
		[setAndSaveWorkflowData],
	);

	const updateNodeData = useCallback(
		<T extends NodeData>(node: T, data: Partial<T>) => {
			if (workflowDesignerRef.current === undefined) {
				return;
			}
			workflowDesignerRef.current.updateNodeData(node, data);
			setAndSaveWorkflowData(workflowDesignerRef.current.getData());
		},
		[setAndSaveWorkflowData],
	);

	const updateNodeDataContent = useCallback(
		<T extends NodeData>(node: T, content: Partial<T["content"]>) => {
			if (workflowDesignerRef.current === undefined) {
				return;
			}
			workflowDesignerRef.current.updateNodeData(node, {
				...node,
				content: { ...node.content, ...content },
			});
			setAndSaveWorkflowData(workflowDesignerRef.current.getData());
		},
		[setAndSaveWorkflowData],
	);

	const addConnection = useCallback(
		(sourceNode: NodeData, targetHandle: ConnectionHandle) => {
			workflowDesignerRef.current?.addConnection(sourceNode, targetHandle);
			setAndSaveWorkflowData(workflowDesignerRef.current.getData());
		},
		[setAndSaveWorkflowData],
	);

	const addTextNode = useCallback(
		(
			params: z.infer<typeof CreateTextNodeParams>,
			options?: { ui?: NodeUIState },
		) => {
			if (workflowDesignerRef.current === undefined) {
				return;
			}
			workflowDesignerRef.current.addTextNode(params, options);
			setAndSaveWorkflowData(workflowDesignerRef.current.getData());
		},
		[setAndSaveWorkflowData],
	);

	const setUiNodeState = useCallback(
		(nodeId: string | NodeId, ui: Partial<NodeUIState>) => {
			if (workflowDesignerRef.current === undefined) {
				return;
			}
			workflowDesignerRef.current.setUiNodeState(nodeId, ui);
			setAndSaveWorkflowData(workflowDesignerRef.current.getData());
		},
		[setAndSaveWorkflowData],
	);

	const deleteNode = useCallback(
		(nodeId: NodeId | string) => {
			if (workflowDesignerRef.current === undefined) {
				return;
			}
			workflowDesignerRef.current.deleteNode(nodeId);
			setAndSaveWorkflowData(workflowDesignerRef.current.getData());
		},
		[setAndSaveWorkflowData],
	);

	const deleteConnection = useCallback(
		(connectionId: ConnectionId) => {
			if (workflowDesignerRef.current === undefined) {
				return;
			}
			workflowDesignerRef.current.deleteConnection(connectionId);
			setAndSaveWorkflowData(workflowDesignerRef.current.getData());
		},
		[setAndSaveWorkflowData],
	);

	const usePropertiesPanelHelper = usePropertiesPanel();
	const useViewHelper = useView();

	return (
		<WorkflowDesignerContext.Provider
			value={{
				data: workflowData,
				textGenerationApi,
				addTextGenerationNode,
				addTextNode,
				addConnection,
				updateNodeData,
				updateNodeDataContent,
				setUiNodeState,
				deleteNode,
				deleteConnection,
				...usePropertiesPanelHelper,
				...useViewHelper,
			}}
		>
			{children}
		</WorkflowDesignerContext.Provider>
	);
}

export function useWorkflowDesigner() {
	const context = useContext(WorkflowDesignerContext);
	if (context === undefined) {
		throw new Error(
			"useWorkflowDesigner must be used within a WorkflowDesignerProvider",
		);
	}
	return context;
}
