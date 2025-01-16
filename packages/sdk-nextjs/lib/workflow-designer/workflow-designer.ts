import type { z } from "zod";
import {
	type NodeData,
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
	connectionId,
} from "../giselle-data/node/types";
import {
	type CreateTextNodeParams,
	createTextNodeData,
} from "../giselle-data/node/variables/text";

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
}

export function WorkflowDesigner({
	defaultValue = generateInitialWorkspace(),
}: {
	defaultValue?: Workspace;
}): WorkflowDesignerOperations {
	const nodes = defaultValue.nodes;
	const connections = defaultValue.connections;
	const ui = defaultValue.ui;
	function addTextGenerationNode(
		params: z.infer<typeof CreateTextGenerationNodeParams>,
		options?: {
			ui?: NodeUIState;
		},
	) {
		const textgenerationNodeData = createTextGenerationNodeData(params);
		nodes.set(textgenerationNodeData.id, textgenerationNodeData);
		if (options?.ui) {
			ui.nodeState.set(textgenerationNodeData.id, options.ui);
		}
	}
	function addTextNode(
		params: z.infer<typeof CreateTextNodeParams>,
		options?: {
			ui?: NodeUIState;
		},
	) {
		const textNodeData = createTextNodeData(params);
		nodes.set(textNodeData.id, textNodeData);
		if (options?.ui) {
			ui.nodeState.set(textNodeData.id, options.ui);
		}
	}
	function getData() {
		return {
			id: defaultValue.id,
			nodes,
			connections,
			ui,
			workflows: defaultValue.workflows,
		};
	}
	function updateNodeData<T extends NodeData>(node: T, data: Partial<T>) {
		nodes.set(node.id, { ...node, ...data });
	}
	function addConnection(
		sourceNode: BaseNodeData,
		targetNodeHandle: ConnectionHandle,
	) {
		const connection = createConnection({
			sourceNode,
			targetNodeHandle,
		});
		connections.set(connection.id, connection);
	}
	function setUiNodeState(
		unsafeNodeId: string | NodeId,
		newUiState: Partial<NodeUIState>,
	): void {
		const targetNodeId = NodeId.parse(unsafeNodeId);
		const nodeState = ui.nodeState.get(targetNodeId);
		ui.nodeState.set(
			targetNodeId,
			NodeUIState.parse({ ...nodeState, ...newUiState }),
		);
	}
	function deleteConnection(connectionId: ConnectionId) {
		connections.delete(connectionId);
	}
	function deleteNode(unsafeNodeId: string | NodeId) {
		const deleteNodeId = NodeId.parse(unsafeNodeId);
		ui.nodeState.delete(deleteNodeId);
		nodes.delete(deleteNodeId);
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
	};
}
