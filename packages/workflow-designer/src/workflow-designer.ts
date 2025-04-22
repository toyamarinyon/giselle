import {
	ConnectionId,
	type Flow,
	FlowId,
	type FlowNode,
	type InputId,
	type Node,
	NodeId,
	type NodeReference,
	NodeUIState,
	type OutputId,
	type Viewport,
	type Workspace,
	generateInitialWorkspace,
} from "@giselle-sdk/data-type";
import { buildWorkflowMap } from "@giselle-sdk/workflow-utils";
import { isSupportedConnection } from "./is-supported-connection";

interface AddNodeOptions {
	ui?: NodeUIState;
}

export type WorkflowDesigner = ReturnType<typeof WorkflowDesigner>;

export function WorkflowDesigner({
	defaultValue = generateInitialWorkspace(),
}: {
	defaultValue?: Workspace;
}) {
	let nodes = defaultValue.nodes;
	let connections = defaultValue.connections;
	const ui = defaultValue.ui;
	let editingWorkflows = defaultValue.editingWorkflows;
	let name = defaultValue.name;
	let flows = defaultValue.flows;
	function updateWorkflowMap() {
		editingWorkflows = Array.from(
			buildWorkflowMap(
				new Map(nodes.map((node) => [node.id, node])),
				new Map(connections.map((connection) => [connection.id, connection])),
			).values(),
		);
	}
	function addNode(node: Node, options?: AddNodeOptions) {
		nodes = [...nodes, node];
		if (options?.ui) {
			ui.nodeState[node.id] = options.ui;
		}
		updateWorkflowMap();
	}
	function getData() {
		return {
			id: defaultValue.id,
			nodes,
			connections,
			name,
			ui,
			editingWorkflows,
			schemaVersion: "20250221",
			flows,
		} satisfies Workspace;
	}
	function updateNodeData<T extends Node>(node: T, data: Partial<T>) {
		nodes = [...nodes.filter((n) => n.id !== node.id), { ...node, ...data }];
		updateWorkflowMap();
	}
	function addConnection({
		outputId,
		outputNode,
		inputId,
		inputNode,
	}: {
		outputNode: Exclude<Node, FlowNode>;
		outputId: OutputId;
		inputNode: Exclude<Node, FlowNode>;
		inputId: InputId;
	}) {
		connections = [
			...connections,
			{
				id: ConnectionId.generate(),
				outputNode: {
					id: outputNode.id,
					type: outputNode.type,
					content: { type: outputNode.content.type },
				} as NodeReference,
				outputId,
				inputNode: {
					id: inputNode.id,
					type: inputNode.type,
					content: { type: inputNode.content.type },
				} as NodeReference,
				inputId,
			},
		];
		const outputNodeFlow = flows.find((flow) =>
			flow.childNodeIds.includes(outputNode.id),
		);
		const inputNodeFlow = flows.find((flow) =>
			flow.childNodeIds.includes(inputNode.id),
		);

		const outputNodeUiState = ui.nodeState[outputNode.id];
		const inputNodeUiState = ui.nodeState[inputNode.id];
		let newOutputNodePosition: { x: number; y: number } | undefined;
		let newInputNodePosition: { x: number; y: number } | undefined;
		if (outputNodeUiState !== undefined && inputNodeUiState !== undefined) {
			newOutputNodePosition = {
				x:
					outputNodeUiState.position.x < inputNodeUiState.position.x
						? 0
						: outputNodeUiState.position.x - inputNodeUiState.position.x,
				y:
					outputNodeUiState.position.y < inputNodeUiState.position.y
						? 0
						: outputNodeUiState.position.y - inputNodeUiState.position.y,
			};
			newInputNodePosition = {
				x:
					inputNodeUiState.position.x < outputNodeUiState.position.x
						? 0
						: inputNodeUiState.position.x - outputNodeUiState.position.x,
				y:
					inputNodeUiState.position.y < outputNodeUiState.position.y
						? 0
						: inputNodeUiState.position.y - outputNodeUiState.position.y,
			};
		}
		if (outputNodeFlow === undefined && inputNodeFlow === undefined) {
			const nodeId = NodeId.generate();
			const newFlow: Flow = {
				id: FlowId.generate(),
				nodeId,
				childNodeIds: [outputNode.id, inputNode.id],
			};
			flows = [...flows, newFlow];
			setUiNodeState(nodeId, {
				position: {
					x: Math.min(
						outputNodeUiState?.position.x ?? 0,
						inputNodeUiState?.position.x ?? 0,
					),
					y: Math.min(
						outputNodeUiState?.position.y ?? 0,
						inputNodeUiState?.position.y ?? 0,
					),
				},
			});
		}
		if (outputNodeFlow === undefined && inputNodeFlow !== undefined) {
			flows = flows.map((flow) =>
				flow.id === inputNodeFlow.id
					? {
							...flow,
							childNodeIds: [...flow.childNodeIds, outputNode.id],
						}
					: flow,
			);
		}
		if (outputNodeFlow !== undefined && inputNodeFlow === undefined) {
			flows = flows.map((flow) =>
				flow.id === outputNodeFlow.id
					? {
							...flow,
							childNodeIds: [...flow.childNodeIds, inputNode.id],
						}
					: flow,
			);
		}
		if (outputNodeFlow !== undefined && inputNodeFlow !== undefined) {
			const mergeFlow: Flow = {
				id: FlowId.generate(),
				nodeId: NodeId.generate(),
				name: `${outputNode.name} & ${inputNode.name}`,
				childNodeIds: [...outputNodeFlow.childNodeIds, inputNode.id],
			};
			flows = [
				...flows.filter(
					(flow) =>
						flow.id !== outputNodeFlow.id && flow.id !== inputNodeFlow.id,
				),
				mergeFlow,
			];
		}
		if (newInputNodePosition) {
			setUiNodeState(inputNode.id, {
				...inputNodeUiState,
				position: newInputNodePosition,
			});
		}
		if (newOutputNodePosition) {
			setUiNodeState(outputNode.id, {
				...outputNodeUiState,
				position: newOutputNodePosition,
			});
		}
		updateWorkflowMap();
	}
	function setUiNodeState(
		unsafeNodeId: string | NodeId,
		newUiState: Partial<NodeUIState>,
	): void {
		const inputNodeId = NodeId.parse(unsafeNodeId);
		const nodeState = ui.nodeState[inputNodeId];
		ui.nodeState[inputNodeId] = NodeUIState.parse({
			...nodeState,
			...newUiState,
		});
	}
	function setUiViewport(viewport: Viewport) {
		ui.viewport = viewport;
	}
	function deleteConnection(connectionId: ConnectionId) {
		connections = connections.filter(
			(connection) => connection.id !== connectionId,
		);
	}
	function deleteNode(unsafeNodeId: string | NodeId) {
		const deleteNodeId = NodeId.parse(unsafeNodeId);
		const deleteNode = nodes.find((node) => node.id === deleteNodeId);
		delete ui.nodeState[deleteNodeId];
		nodes = nodes.filter((node) => node.id !== deleteNodeId);
		updateWorkflowMap();
		return deleteNode;
	}
	function updateName(newName: string | undefined) {
		name = newName;
	}

	return {
		addNode,
		addConnection,
		getData,
		updateNodeData,
		setUiNodeState,
		setUiViewport,
		deleteNode,
		deleteConnection,
		updateName,
		isSupportedConnection,
	};
}
