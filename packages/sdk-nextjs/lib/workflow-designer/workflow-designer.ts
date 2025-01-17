import type { z } from "zod";
import {
	type NodeData,
	type WorkflowId,
	type WorkflowRun,
	type WorkflowRunId,
	type Workspace,
	createConnection,
	generateInitialWorkspace,
} from "../giselle-data";
import {
	type CreateTextGenerationNodeParams,
	createTextGenerationNodeData,
} from "../giselle-data/node/actions/text-generation";
import {
	type BaseNodeData,
	type ConnectionHandle,
	type ConnectionId,
	NodeId,
	NodeUIState,
} from "../giselle-data/node/types";
import {
	type CreateTextNodeParams,
	createTextNodeData,
} from "../giselle-data/node/variables/text";
import {
	type RunWorkflowEventHandlers,
	buildWorkflowMap,
	buildWorkflowRun,
	runWorkflow as runWorkflowInternal,
} from "../workflow-utils";

interface addNodeOptions {
	ui?: NodeUIState;
}

export interface WorkflowDesignerOperations {
	addTextGenerationNode: (
		params: z.infer<typeof CreateTextGenerationNodeParams>,
		options?: addNodeOptions,
	) => void;
	addTextNode: (
		params: z.infer<typeof CreateTextNodeParams>,
		options?: addNodeOptions,
	) => void;
	getData: () => Workspace;
	addConnection: (
		sourceNode: NodeData,
		targetNodeHandle: ConnectionHandle,
	) => void;
	setUiNodeState: (
		nodeId: string | NodeId,
		newUiState: Partial<NodeUIState>,
	) => void;
	deleteNode: (nodeId: string | NodeId) => void;
	deleteConnection: (connectionId: ConnectionId) => void;
	updateNodeData: <T extends NodeData>(node: T, data: Partial<T>) => void;
	createWorkflow: (workflowId: WorkflowId) => WorkflowRun;
	runWorkflow: (
		params: { workflowRunId: WorkflowRunId } & RunWorkflowEventHandlers,
	) => Promise<void>;
}

export function WorkflowDesigner({
	defaultValue = generateInitialWorkspace(),
}: {
	defaultValue?: Workspace;
}): WorkflowDesignerOperations {
	const nodeMap = defaultValue.nodeMap;
	const connectionMap = defaultValue.connectionMap;
	const ui = defaultValue.ui;
	let workflowMap = defaultValue.workflowMap;
	const workflowRunMap = defaultValue.workflowRunMap;
	function updateWorkflowMap() {
		workflowMap = buildWorkflowMap(nodeMap, connectionMap);
	}
	function addTextGenerationNode(
		params: z.infer<typeof CreateTextGenerationNodeParams>,
		options?: {
			ui?: NodeUIState;
		},
	) {
		const textgenerationNodeData = createTextGenerationNodeData(params);
		nodeMap.set(textgenerationNodeData.id, textgenerationNodeData);
		if (options?.ui) {
			ui.nodeStateMap.set(textgenerationNodeData.id, options.ui);
		}
		updateWorkflowMap();
	}
	function addTextNode(
		params: z.infer<typeof CreateTextNodeParams>,
		options?: {
			ui?: NodeUIState;
		},
	) {
		const textNodeData = createTextNodeData(params);
		nodeMap.set(textNodeData.id, textNodeData);
		if (options?.ui) {
			ui.nodeStateMap.set(textNodeData.id, options.ui);
		}
		updateWorkflowMap();
	}
	function getData() {
		return {
			id: defaultValue.id,
			nodeMap,
			connectionMap,
			ui,
			workflowMap,
			workflowRunMap,
		};
	}
	function updateNodeData<T extends NodeData>(node: T, data: Partial<T>) {
		nodeMap.set(node.id, { ...node, ...data });
	}
	function addConnection(
		sourceNode: BaseNodeData,
		targetNodeHandle: ConnectionHandle,
	) {
		const connection = createConnection({
			sourceNode,
			targetNodeHandle,
		});
		connectionMap.set(connection.id, connection);
		updateWorkflowMap();
	}
	function setUiNodeState(
		unsafeNodeId: string | NodeId,
		newUiState: Partial<NodeUIState>,
	): void {
		const targetNodeId = NodeId.parse(unsafeNodeId);
		const nodeState = ui.nodeStateMap.get(targetNodeId);
		ui.nodeStateMap.set(
			targetNodeId,
			NodeUIState.parse({ ...nodeState, ...newUiState }),
		);
	}
	function deleteConnection(connectionId: ConnectionId) {
		connectionMap.delete(connectionId);
	}
	function deleteNode(unsafeNodeId: string | NodeId) {
		const deleteNodeId = NodeId.parse(unsafeNodeId);
		ui.nodeStateMap.delete(deleteNodeId);
		nodeMap.delete(deleteNodeId);
		updateWorkflowMap();
	}
	function createWorkflow(workflowId: WorkflowId) {
		const workflow = workflowMap.get(workflowId);
		if (workflow === undefined) {
			buildWorkflowMap(nodeMap, connectionMap);
			throw new Error(`Workflow with id ${workflowId} not found`);
		}
		const workflowRun = buildWorkflowRun(workflow);
		workflowRunMap.set(workflowRun.id, workflowRun);
		return workflowRun;
	}
	async function runWorkflow({
		workflowRunId,
		...eventHandlers
	}: { workflowRunId: WorkflowRunId } & RunWorkflowEventHandlers) {
		const workflowRun = workflowRunMap.get(workflowRunId);
		if (workflowRun === undefined) {
			throw new Error(`Workflow run with id ${workflowRunId} not found`);
		}
		const workflow = workflowMap.get(workflowRun.workflowId);
		if (workflow === undefined) {
			throw new Error(`Workflow with id ${workflowRun.workflowId} not found`);
		}
		await runWorkflowInternal({
			workflow,
			workflowRun,
			...eventHandlers,
		});
	}

	return {
		addTextGenerationNode,
		addTextNode,
		addConnection,
		getData,
		updateNodeData,
		setUiNodeState,
		deleteNode,
		deleteConnection,
		createWorkflow,
		runWorkflow,
	};
}
