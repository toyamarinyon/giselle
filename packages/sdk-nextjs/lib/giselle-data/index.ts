import { createIdGenerator } from "@/lib/utils/generate-id";
import { z } from "zod";
import {
	Connection,
	ConnectionId,
	NodeData,
	NodeId,
	NodeUIState,
} from "./node";
import { TextGenerationNodeData } from "./node/actions";
import { createConnection, createConnectionHandle } from "./node/connection";
import { TextNodeData } from "./node/variables";
import { mapToObject, objectToMap } from "./utils";
import {
	Job,
	JobId,
	Step,
	StepId,
	Workflow,
	WorkflowId,
	WorkflowJson,
} from "./workflow";
import {
	JobRun,
	JobRunId,
	StepRun,
	StepRunId,
	StepRunStatus,
	WorkflowRun,
	WorkflowRunId,
	WorkflowRunJson,
} from "./workflow-run";
import { WorkspaceId } from "./workspace";

export const Workspace = z.object({
	id: WorkspaceId.schema,
	nodeMap: z.preprocess(objectToMap, z.map(NodeId.schema, NodeData)),
	connectionMap: z.preprocess(
		objectToMap,
		z.map(ConnectionId.schema, Connection),
	),
	ui: z.object({
		nodeStateMap: z.preprocess(objectToMap, z.map(NodeId.schema, NodeUIState)),
	}),
	workflowMap: z.preprocess(objectToMap, z.map(WorkflowId.schema, Workflow)),
	editingWorkflowMap: z.preprocess(
		objectToMap,
		z.map(WorkflowId.schema, Workflow),
	),
	workflowRunMap: z.preprocess(
		objectToMap,
		z.map(WorkflowRunId.schema, WorkflowRun),
	),
});
export type Workspace = z.infer<typeof Workspace>;
export const WorkspaceJson = Workspace.extend({
	nodeMap: z.preprocess(mapToObject, z.record(NodeId.schema, NodeData)),
	connectionMap: z.preprocess(
		mapToObject,
		z.record(ConnectionId.schema, Connection),
	),
	ui: z.object({
		nodeStateMap: z.preprocess(
			mapToObject,
			z.record(NodeId.schema, NodeUIState),
		),
	}),
	workflowMap: z.preprocess(
		mapToObject,
		z.record(WorkflowId.schema, WorkflowJson),
	),
	editingWorkflowMap: z.preprocess(
		mapToObject,
		z.record(WorkflowId.schema, WorkflowJson),
	),
	workflowRunMap: z.preprocess(
		mapToObject,
		z.record(WorkflowRunId.schema, WorkflowRunJson),
	),
});
export type WorkspaceJson = z.infer<typeof WorkspaceJson>;

export function generateInitialWorkspace() {
	return {
		id: WorkspaceId.generate(),
		nodeMap: new Map(),
		connectionMap: new Map(),
		ui: {
			nodeStateMap: new Map(),
		},
		workflowMap: new Map(),
		workflowRunMap: new Map(),
		editingWorkflowMap: new Map(),
	} satisfies Workspace;
}

export {
	TextNodeData,
	TextGenerationNodeData,
	createConnection,
	createConnectionHandle,
	NodeData,
	NodeId,
	Job,
	JobId,
	JobRun,
	JobRunId,
	Step,
	StepId,
	StepRun,
	StepRunId,
	StepRunStatus,
	Workflow,
	WorkflowId,
	WorkflowRun,
	WorkflowRunId,
	Connection,
	ConnectionId,
	WorkspaceId,
};
