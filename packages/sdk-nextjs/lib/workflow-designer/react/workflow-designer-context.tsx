"use client";

import { callSaveWorkflowApi } from "@/lib/ui-utils";
import { WorkflowRunnerProvider } from "@/lib/workflow-runner/react";
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
} from "../../giselle-data";
import type { CreateTextGenerationNodeParams } from "../../giselle-data/node/actions/text-generation";
import type {
	ConnectionHandle,
	ConnectionId,
	NodeId,
	NodeUIState,
} from "../../giselle-data/node/types";
import type { CreateTextNodeParams } from "../../giselle-data/node/variables/text";
import {
	WorkflowDesigner,
	type WorkflowDesignerOperations,
} from "../workflow-designer";
import { usePropertiesPanel, useView } from "./state";

interface CreateWorkflowRunParams {
	workflowId: WorkflowId;
	onBeforeWorkflowRunCreate?: () => void;
}
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
	data: Workspace;
	textGenerationApi: string;
	updateNodeDataContent: <T extends NodeData>(
		node: T,
		content: Partial<T["content"]>,
	) => void;
	createWorkflowRun: (params: CreateWorkflowRunParams) => Promise<WorkflowRun>;
}
const WorkflowDesignerContext = createContext<
	WorkflowDesignerContextValue | undefined
>(undefined);

export function WorkflowDesignerProvider({
	children,
	data,
	saveWorkflowApi = "/api/giselle/save-workspace",
	textGenerationApi = "/api/giselle/text-generation",
	saveWorkflowDelay: defaultSaveWorkflowDelay = 1000,
}: {
	children: React.ReactNode;
	data: Workspace;
	saveWorkflowApi?: string;
	textGenerationApi?: string;
	saveWorkflowDelay?: number;
}) {
	const workflowDesignerRef = useRef(
		WorkflowDesigner({
			defaultValue: data,
		}),
	);
	const [workspace, setWorkspace] = useState(data);
	const persistTimeoutRef = useRef<Timer | null>(null);

	const saveWorkspace = useCallback(async () => {
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
	const setAndSaveWorkspace = useCallback(
		(saveWorkspaceDelay?: number) => {
			setWorkspaceInternal();
			if (persistTimeoutRef.current) {
				clearTimeout(persistTimeoutRef.current);
			}
			if (saveWorkspaceDelay === 0) {
				saveWorkspace();
				return;
			}
			persistTimeoutRef.current = setTimeout(
				saveWorkspace,
				saveWorkspaceDelay ?? defaultSaveWorkflowDelay,
			);
		},
		[setWorkspaceInternal, saveWorkspace, defaultSaveWorkflowDelay],
	);

	const addTextGenerationNode = useCallback(
		(
			params: z.infer<typeof CreateTextGenerationNodeParams>,
			options?: { ui?: NodeUIState },
		) => {
			workflowDesignerRef.current.addTextGenerationNode(params, options);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const updateNodeData = useCallback(
		<T extends NodeData>(node: T, data: Partial<T>) => {
			workflowDesignerRef.current.updateNodeData(node, data);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const updateNodeDataContent = useCallback(
		<T extends NodeData>(node: T, content: Partial<T["content"]>) => {
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
			workflowDesignerRef.current.addTextNode(params, options);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const setUiNodeState = useCallback(
		(nodeId: string | NodeId, ui: Partial<NodeUIState>) => {
			workflowDesignerRef.current.setUiNodeState(nodeId, ui);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const deleteNode = useCallback(
		(nodeId: NodeId | string) => {
			workflowDesignerRef.current.deleteNode(nodeId);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const deleteConnection = useCallback(
		(connectionId: ConnectionId) => {
			workflowDesignerRef.current.deleteConnection(connectionId);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const createWorkflowRun = useCallback(
		async ({
			workflowId,
			onBeforeWorkflowRunCreate,
		}: CreateWorkflowRunParams) => {
			const workflowRun =
				workflowDesignerRef.current.createWorkflow(workflowId);
			onBeforeWorkflowRunCreate?.();
			setAndSaveWorkspace(0);
			return workflowRun;
		},
		[setAndSaveWorkspace],
	);

	const usePropertiesPanelHelper = usePropertiesPanel();
	const useViewHelper = useView();

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
				createWorkflowRun,
				...usePropertiesPanelHelper,
				...useViewHelper,
			}}
		>
			<WorkflowRunnerProvider onWorkflowRunUpdate={() => {}}>
				{children}
			</WorkflowRunnerProvider>
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
