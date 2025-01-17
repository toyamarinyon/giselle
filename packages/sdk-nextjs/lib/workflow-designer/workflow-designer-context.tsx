"use client";

import { callSaveWorkflowApi } from "@/lib/ui-utils";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import type { z } from "zod";
import type {
	NodeData,
	WorkflowId,
	WorkflowRun,
	WorkflowRunId,
	Workspace,
} from "../giselle-data";
import type { CreateTextGenerationNodeParams } from "../giselle-data/node/actions/text-generation";
import type {
	ConnectionHandle,
	ConnectionId,
	NodeId,
	NodeUIState,
} from "../giselle-data/node/types";
import type { CreateTextNodeParams } from "../giselle-data/node/variables/text";
import { type WorkflowWithRun, buildWorkflowWithRun } from "../workflow-utils";
import { useActiveWorkflowRunId, usePropertiesPanel, useView } from "./state";
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
			| "createWorkflow"
		>,
		ReturnType<typeof usePropertiesPanel>,
		ReturnType<typeof useView>,
		Pick<ReturnType<typeof useActiveWorkflowRunId>, "setActiveWorkflowRunId"> {
	data: Workspace;
	textGenerationApi: string;
	updateNodeDataContent: <T extends NodeData>(
		node: T,
		content: Partial<T["content"]>,
	) => void;
	activeWorkflowWithRun: WorkflowWithRun | undefined;
	runWorkflow: (workflowRunId: WorkflowRunId) => Promise<void>;
}
const WorkflowDesignerContext = createContext<
	WorkflowDesignerContextValue | undefined
>(undefined);

export function WorkflowDesignerProvider({
	children,
	data,
	saveWorkflowApi = "/api/giselle/save-workspace",
	textGenerationApi = "/api/giselle/text-generation",
}: {
	children: React.ReactNode;
	data: Workspace;
	saveWorkflowApi?: string;
	textGenerationApi?: string;
}) {
	const workflowDesignerRef = useRef(
		WorkflowDesigner({
			defaultValue: data,
		}),
	);
	const [workspace, setWorkspace] = useState(data);
	const persistTimeoutRef = useRef<Timer | null>(null);
	const isPendingPersistRef = useRef(false);

	const saveWorkspace = useCallback(async () => {
		isPendingPersistRef.current = false;
		try {
			await callSaveWorkflowApi({
				api: saveWorkflowApi,
				workspaceId: workspace.id,
				workspace,
			});
		} catch (error) {
			console.error("Failed to persist graph:", error);
		}
	}, [saveWorkflowApi, workspace]);

	const setWorkspaceInternal = useCallback(() => {
		const data = workflowDesignerRef.current.getData();
		setWorkspace(data);
	}, []);
	const setAndSaveWorkspace = useCallback(() => {
		setWorkspaceInternal();
		isPendingPersistRef.current = true;
		if (persistTimeoutRef.current) {
			clearTimeout(persistTimeoutRef.current);
		}
		persistTimeoutRef.current = setTimeout(saveWorkspace, 500);
	}, [setWorkspaceInternal, saveWorkspace]);

	const addTextGenerationNode = useCallback(
		(
			params: z.infer<typeof CreateTextGenerationNodeParams>,
			options?: { ui?: NodeUIState },
		) => {
			if (workflowDesignerRef.current === undefined) {
				return;
			}
			workflowDesignerRef.current.addTextGenerationNode(params, options);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const updateNodeData = useCallback(
		<T extends NodeData>(node: T, data: Partial<T>) => {
			if (workflowDesignerRef.current === undefined) {
				return;
			}
			workflowDesignerRef.current.updateNodeData(node, data);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
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
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const addConnection = useCallback(
		(sourceNode: NodeData, targetHandle: ConnectionHandle) => {
			workflowDesignerRef.current?.addConnection(sourceNode, targetHandle);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
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
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const setUiNodeState = useCallback(
		(nodeId: string | NodeId, ui: Partial<NodeUIState>) => {
			if (workflowDesignerRef.current === undefined) {
				return;
			}
			workflowDesignerRef.current.setUiNodeState(nodeId, ui);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const deleteNode = useCallback(
		(nodeId: NodeId | string) => {
			if (workflowDesignerRef.current === undefined) {
				return;
			}
			workflowDesignerRef.current.deleteNode(nodeId);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const deleteConnection = useCallback(
		(connectionId: ConnectionId) => {
			if (workflowDesignerRef.current === undefined) {
				return;
			}
			workflowDesignerRef.current.deleteConnection(connectionId);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const createWorkflow = useCallback(
		(workflowId: WorkflowId) => {
			if (workflowDesignerRef.current === undefined) {
				throw new Error("Workflow designer not initialized");
			}
			const workflowRun =
				workflowDesignerRef.current.createWorkflow(workflowId);
			setAndSaveWorkspace();
			return workflowRun;
		},
		[setAndSaveWorkspace],
	);

	const runWorkflow = useCallback(
		async (workflowRunId: WorkflowRunId) => {
			if (workflowDesignerRef.current === undefined) {
				throw new Error("Workflow designer not initialized");
			}
			await workflowDesignerRef.current.runWorkflow({
				workflowRunId,
				onStepRunUpdate: () => {
					setAndSaveWorkspace();
				},
			});
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const usePropertiesPanelHelper = usePropertiesPanel();
	const useViewHelper = useView();
	const { setActiveWorkflowRunId, activeWorkflowRunId } =
		useActiveWorkflowRunId();

	const activeWorkflowWithRun = useMemo(() => {
		if (activeWorkflowRunId === undefined) {
			return undefined;
		}
		const workflowRun = workspace.workflowRunMap.get(activeWorkflowRunId);
		if (workflowRun === undefined) {
			throw new Error(`Workflow run with id ${activeWorkflowRunId} not found`);
		}
		const workflow = workspace.workflowMap.get(workflowRun.workflowId);
		if (workflow === undefined) {
			throw new Error(`Workflow with id ${workflowRun.workflowId} not found`);
		}
		return buildWorkflowWithRun(workflow, workflowRun);
	}, [workspace, activeWorkflowRunId]);

	return (
		<WorkflowDesignerContext.Provider
			value={{
				data: workspace,
				textGenerationApi,
				addTextGenerationNode,
				addTextNode,
				addConnection,
				updateNodeData,
				updateNodeDataContent,
				setUiNodeState,
				deleteNode,
				deleteConnection,
				createWorkflow,
				runWorkflow,
				...usePropertiesPanelHelper,
				...useViewHelper,
				setActiveWorkflowRunId,
				activeWorkflowWithRun: activeWorkflowWithRun,
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
