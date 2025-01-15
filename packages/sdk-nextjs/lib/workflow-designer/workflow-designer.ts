import type { z } from "zod";
import {
	type NodeData,
	type WorkflowData,
	generateInitialWorkflowData,
} from "../workflow-data";
import {
	type CreateTextGenerationNodeParams,
	createTextGenerationNodeData,
} from "../workflow-data/node/actions/text-generation";
import { createConnection } from "../workflow-data/node/connection";
import {
	type BaseNodeData,
	type ConnectionHandle,
	type NodeId,
	type NodeUIState,
	connectionId,
} from "../workflow-data/node/types";
import {
	type CreateTextNodeParams,
	createTextNodeData,
} from "../workflow-data/node/variables/text";

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
	getData: () => WorkflowData;
	updateNodeData: (nodeId: NodeId, data: NodeData) => void;
	addConnection: (
		sourceNode: NodeData,
		targetNodeHandle: ConnectionHandle,
	) => void;
}

export function WorkflowDesigner({
	defaultValue = generateInitialWorkflowData(),
}: {
	defaultValue?: WorkflowData;
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
		};
	}
	function updateNodeData(nodeId: NodeId, data: NodeData) {
		nodes.set(nodeId, data);
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

	return {
		addTextGenerationNode,
		addTextNode,
		addConnection,
		getData,
		updateNodeData,
	};
}
