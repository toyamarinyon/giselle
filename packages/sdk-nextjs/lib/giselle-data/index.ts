import { createIdGenerator } from "@/lib/utils/generate-id";
import { z } from "zod";
import {
	Connection,
	NodeData,
	NodeId,
	NodeUIState,
	connectionId,
} from "./node";
import { TextGenerationNodeData } from "./node/actions";
import { createConnection, createConnectionHandle } from "./node/connection";
import { TextNodeData } from "./node/variables";
import { Workflow, WorkflowId, WorkflowJson } from "./workflow";

export const WorkspaceId = createIdGenerator("wrks");
export type WorkspaceId = z.infer<typeof WorkspaceId.schema>;

export const Workspace = z.object({
	id: WorkspaceId.schema,
	nodes: z.preprocess(
		(args) => {
			if (typeof args !== "object" || args === null || args instanceof Map) {
				return args;
			}
			return new Map(Object.entries(args));
		},
		z.map(NodeId.schema, NodeData),
	),
	connections: z.preprocess(
		(args) => {
			if (typeof args !== "object" || args === null || args instanceof Map) {
				return args;
			}
			return new Map(Object.entries(args));
		},
		z.map(connectionId.schema, Connection),
	),
	ui: z.object({
		nodeState: z.preprocess(
			(args) => {
				if (typeof args !== "object" || args === null || args instanceof Map) {
					return args;
				}
				return new Map(Object.entries(args));
			},
			z.map(NodeId.schema, NodeUIState),
		),
	}),
	workflows: z.preprocess(
		(args) => {
			if (typeof args !== "object" || args === null || args instanceof Map) {
				return args;
			}
			return new Map(Object.entries(args));
		},
		z.map(WorkflowId.schema, Workflow),
	),
});
export type Workspace = z.infer<typeof Workspace>;
export const WorkspaceJson = Workspace.extend({
	nodes: z.preprocess(
		(args) => {
			if (args instanceof Map) {
				return Object.fromEntries(args);
			}
			return args;
		},
		z.record(NodeId.schema, NodeData),
	),
	connections: z.preprocess(
		(args) => {
			if (args instanceof Map) {
				return Object.fromEntries(args);
			}
			return args;
		},
		z.record(connectionId.schema, Connection),
	),
	ui: z.object({
		nodeState: z.preprocess(
			(args) => {
				if (args instanceof Map) {
					return Object.fromEntries(args);
				}
				return args;
			},
			z.record(NodeId.schema, NodeUIState),
		),
	}),
	workflows: z.preprocess(
		(args) => {
			if (args instanceof Map) {
				return Object.fromEntries(args);
			}
			return args;
		},
		z.record(WorkflowId.schema, Workflow),
	),
});
export type WorkspaceJson = z.infer<typeof WorkspaceJson>;

export function generateInitialWorkspace() {
	return Workspace.parse({
		id: WorkspaceId.generate(),
		nodes: new Map(),
		connections: new Map(),
		ui: {
			nodeState: new Map(),
		},
		workflows: new Map(),
	});
}

export {
	TextNodeData,
	TextGenerationNodeData,
	createConnection,
	createConnectionHandle,
	NodeData,
	NodeId,
};
