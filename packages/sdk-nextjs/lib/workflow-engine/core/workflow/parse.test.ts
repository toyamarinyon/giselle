import type { NodeData } from "@/lib/workflow-data";
import type { NodeId } from "@/lib/workflow-data/node/types";
import { describe, expect, test } from "vitest";
import {
	createConnectionMap,
	createJobSet,
	findConnectedConnectionMap,
	findConnectedNodeMap,
} from "./parse";
import {
	connection1,
	connection2,
	connection3,
	connection4,
	testWorkflowData,
	textGenerationNode1,
	textGenerationNode2,
	textGenerationNode3,
	textGenerationNode4,
	textGenerationNode5,
	textNode1,
} from "./tests/fixtures";

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
			[textGenerationNode4.id, new Set([textGenerationNode5.id])],
			[textGenerationNode5.id, new Set([textGenerationNode4.id])],
		]),
	);
});

describe("findConnectedComponent", () => {
	const connectionMap = createConnectionMap(
		new Set(testWorkflowData.connections.values()),
		new Set(testWorkflowData.nodes.keys()),
	);
	test("start by textGenerationNode1", () => {
		expect(
			findConnectedNodeMap(
				textGenerationNode1.id,
				testWorkflowData.nodes,
				connectionMap,
			),
		).toStrictEqual(
			new Map<NodeId, NodeData>([
				[textGenerationNode1.id, textGenerationNode1],
				[textNode1.id, textNode1],
				[textGenerationNode2.id, textGenerationNode2],
				[textGenerationNode3.id, textGenerationNode3],
			]),
		);
	});
	test("start by textGenerationNode4", () => {
		expect(
			findConnectedNodeMap(
				textGenerationNode4.id,
				testWorkflowData.nodes,
				connectionMap,
			),
		).toStrictEqual(
			new Map<NodeId, NodeData>([
				[textGenerationNode4.id, textGenerationNode4],
				[textGenerationNode5.id, textGenerationNode5],
			]),
		);
	});
});

describe("findConnectedConnections", () => {
	const connectionMap = createConnectionMap(
		new Set(testWorkflowData.connections.values()),
		new Set(testWorkflowData.nodes.keys()),
	);
	test("start by textGenerationNode1", () => {
		const connectedNodeMap = findConnectedNodeMap(
			textGenerationNode1.id,
			testWorkflowData.nodes,
			connectionMap,
		);
		expect(
			findConnectedConnectionMap(
				new Set(connectedNodeMap.keys()),
				new Set(testWorkflowData.connections.values()),
			),
		).toStrictEqual(
			new Map([
				[connection1.id, connection1],
				[connection2.id, connection2],
				[connection3.id, connection3],
			]),
		);
	});
	test("start by textGenerationNode4", () => {
		const connectedNodeMap = findConnectedNodeMap(
			textGenerationNode4.id,
			testWorkflowData.nodes,
			connectionMap,
		);
		expect(
			findConnectedConnectionMap(
				new Set(connectedNodeMap.keys()),
				new Set(testWorkflowData.connections.values()),
			),
		).toStrictEqual(new Map([[connection4.id, connection4]]));
	});
});
describe("createJobsFromGraph", () => {
	const connectionMap = createConnectionMap(
		new Set(testWorkflowData.connections.values()),
		new Set(testWorkflowData.nodes.keys()),
	);
	test("start by textGenerationNode1", () => {
		const connectedNodeMap = findConnectedNodeMap(
			textGenerationNode1.id,
			testWorkflowData.nodes,
			connectionMap,
		);
		const connectedConnectionMap = findConnectedConnectionMap(
			new Set(connectedNodeMap.keys()),
			new Set(testWorkflowData.connections.values()),
		);
		const jobSet = createJobSet(
			new Set(connectedNodeMap.values()),
			new Set(connectedConnectionMap.values()),
		);
		expect(jobSet.size).toBe(3);
		const jobSetIterator = jobSet.values();
		const firstJob = jobSetIterator.next().value;
		expect(firstJob?.stepSet.size).toBe(1);
		const firstJobFirstStep = firstJob?.stepSet.values().next().value;
		expect(firstJobFirstStep?.nodeId).toBe(textGenerationNode1.id);
		const secondJob = jobSetIterator.next().value;
		expect(secondJob?.stepSet.size).toBe(1);
		const secondJobFirstStep = secondJob?.stepSet.values().next().value;
		expect(secondJobFirstStep?.nodeId).toBe(textGenerationNode2.id);
		const thirdJob = jobSetIterator.next().value;
		expect(thirdJob?.stepSet.size).toBe(1);
		const thirdJobFirstStep = thirdJob?.stepSet.values().next().value;
		expect(thirdJobFirstStep?.nodeId).toBe(textGenerationNode3.id);
	});
	test("start by textGenerationNode4", () => {
		const connectedNodeMap = findConnectedNodeMap(
			textGenerationNode4.id,
			testWorkflowData.nodes,
			connectionMap,
		);
		const connectedConnectionMap = findConnectedConnectionMap(
			new Set(connectedNodeMap.keys()),
			new Set(testWorkflowData.connections.values()),
		);
		const jobSet = createJobSet(
			new Set(connectedNodeMap.values()),
			new Set(connectedConnectionMap.values()),
		);
		expect(jobSet.size).toBe(2);
		const firstJob = jobSet.values().next().value;
		expect(firstJob?.stepSet.size).toBe(1);
		const firstJobFirstStep = firstJob?.stepSet.values().next().value;
		expect(firstJobFirstStep?.nodeId).toBe(textGenerationNode4.id);
	});
});
