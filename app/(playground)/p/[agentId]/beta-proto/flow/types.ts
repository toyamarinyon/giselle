import type { GiselleNodeId } from "../giselle-node/types";

export type FlowId = `flw_${string}`;

export const flowStatuses = {
	queued: "queued",
	running: "running",
	completed: "completed",
	failed: "failed",
} as const;

type FlowStatus = (typeof flowStatuses)[keyof typeof flowStatuses];

interface BaseFlow {
	object: "flow";
	id: FlowId;
}
export interface QueuedFlow extends BaseFlow {
	status: Extract<FlowStatus, "queued">;
	finalNodeId: GiselleNodeId;
}

export interface RunningFlow extends BaseFlow {
	status: Extract<FlowStatus, "running">;
	finalNodeId: GiselleNodeId;
	actionLayers: FlowActionLayer[];
}

export type Flow = QueuedFlow | RunningFlow;

export type FlowActionLayerId = `flw.stk_${string}`;
export const flowActionLayerStatuses = {
	queued: "queued",
	running: "running",
	completed: "completed",
	failed: "failed",
} as const;
type FlowActionLayerType =
	(typeof flowActionLayerStatuses)[keyof typeof flowActionLayerStatuses];
interface BaseFlowActionLayer {
	object: "flow.actionLayer";
	id: FlowActionLayerId;
	actions: FlowAction[];
}
interface QueuedFlowActionLayer extends BaseFlowActionLayer {
	status: Extract<FlowActionLayerType, "queued">;
}
interface RunningFlowActionLayer extends BaseFlowActionLayer {
	status: Extract<FlowActionLayerType, "running">;
}
export type FlowActionLayer = QueuedFlowActionLayer | RunningFlowActionLayer;

export type FlowActionId = `flw.act_${string}`;
export const flowActionStatuses = {
	queued: "queued",
	running: "running",
	completed: "completed",
	failed: "failed",
} as const;

type FlowActionStatus =
	(typeof flowActionStatuses)[keyof typeof flowActionStatuses];

interface BaseFlowAction {
	id: FlowActionId;
	object: "flow.action";
	nodeId: GiselleNodeId;
}
interface QueuedFlowAction extends BaseFlowAction {
	status: Extract<FlowActionStatus, "queued">;
}
interface RunningFlowAction extends BaseFlowAction {
	status: Extract<FlowActionStatus, "running">;
}

export type FlowAction = QueuedFlowAction | RunningFlowAction;
