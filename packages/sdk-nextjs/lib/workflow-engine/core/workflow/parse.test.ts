import {
	type NodeData,
	WorkflowData,
	createConnection,
	createConnectionHandle,
	generateInitialWorkflowData,
} from "@/lib/workflow-data";
import { createTextGenerationNodeData } from "@/lib/workflow-data/node/actions/text-generation";
import type { NodeId } from "@/lib/workflow-data/node/types";
import { createTextNodeData } from "@/lib/workflow-data/node/variables/text";
import { expect, test } from "vitest";
import { createConnectionMap, findConnectedComponent } from "./parse";

const textGenerationNode1 = createTextGenerationNodeData({
	name: "Text Generation Node 1",
});
const textGenerationNode2 = createTextGenerationNodeData({
	name: "Text Generation Node 2",
});
const textGenerationNode3 = createTextGenerationNodeData({
	name: "Text Generation Node 3",
});
const textNode1 = createTextNodeData({
	name: "Text Node 1",
});
const connectionHandle1 = createConnectionHandle({
	label: "source",
	nodeId: textGenerationNode1.id,
	nodeType: textGenerationNode1.type,
});
const connection1 = createConnection({
	sourceNode: textNode1,
	targetNodeHandle: connectionHandle1,
});
const connectionHandle2 = createConnectionHandle({
	label: "source",
	nodeId: textGenerationNode2.id,
	nodeType: textGenerationNode2.type,
});
const connection2 = createConnection({
	sourceNode: textGenerationNode1,
	targetNodeHandle: connectionHandle2,
});
const connectionHandle3 = createConnectionHandle({
	label: "source",
	nodeId: textGenerationNode3.id,
	nodeType: textGenerationNode3.type,
});
const connection3 = createConnection({
	sourceNode: textGenerationNode2,
	targetNodeHandle: connectionHandle3,
});
const testWorkflowData = WorkflowData.parse({
	...generateInitialWorkflowData(),
	nodes: new Map<NodeId, NodeData>([
		[textGenerationNode1.id, textGenerationNode1],
		[textNode1.id, textNode1],
		[textGenerationNode2.id, textGenerationNode2],
		[textGenerationNode3.id, textGenerationNode3],
	]),
	connections: new Map([
		[connection1.id, connection1],
		[connection2.id, connection2],
		[connection3.id, connection3],
	]),
});

test("createConnectionMap", () => {
	expect(
		createConnectionMap(
			new Set(testWorkflowData.connections.values()),
			new Set(testWorkflowData.nodes.keys()),
		),
	).toStrictEqual(
		new Map([
			[textNode1.id, new Set([textGenerationNode1.id])],
			[textGenerationNode1.id, new Set([textNode1.id, textGenerationNode2.id])],
			[
				textGenerationNode2.id,
				new Set([textGenerationNode1.id, textGenerationNode3.id]),
			],
			[textGenerationNode3.id, new Set([textGenerationNode2.id])],
		]),
	);
});

test("findConnectedComponent", () => {
	const connectionMap = createConnectionMap(
		new Set(testWorkflowData.connections.values()),
		new Set(testWorkflowData.nodes.keys()),
	);
	expect(
		findConnectedComponent(textGenerationNode1.id, connectionMap),
	).toStrictEqual(
		new Set([
			textGenerationNode1.id,
			textNode1.id,
			textGenerationNode2.id,
			textGenerationNode3.id,
		]),
	);
});
