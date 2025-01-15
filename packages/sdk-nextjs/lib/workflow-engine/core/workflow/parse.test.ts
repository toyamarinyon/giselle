import { describe, expect, test } from "vitest";
import {
	createConnectionMap,
	findConnectedConnections,
	findConnectedNodes,
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
			findConnectedNodes(textGenerationNode1.id, connectionMap),
		).toStrictEqual(
			new Set([
				textGenerationNode1.id,
				textNode1.id,
				textGenerationNode2.id,
				textGenerationNode3.id,
			]),
		);
	});
	test("start by textGenerationNode4", () => {
		expect(
			findConnectedNodes(textGenerationNode4.id, connectionMap),
		).toStrictEqual(new Set([textGenerationNode4.id, textGenerationNode5.id]));
	});
});

describe("findConnectedConnections", () => {
	const connectionMap = createConnectionMap(
		new Set(testWorkflowData.connections.values()),
		new Set(testWorkflowData.nodes.keys()),
	);
	test("start by textGenerationNode1", () => {
		const connectedNodeIdSet = findConnectedNodes(
			textGenerationNode1.id,
			connectionMap,
		);
		expect(
			findConnectedConnections(
				connectedNodeIdSet,
				new Set(testWorkflowData.connections.values()),
			),
		).toStrictEqual(new Set([connection1.id, connection2.id, connection3.id]));
	});
	test("start by textGenerationNode4", () => {
		const connectedNodeIdSet = findConnectedNodes(
			textGenerationNode4.id,
			connectionMap,
		);
		expect(
			findConnectedConnections(
				connectedNodeIdSet,
				new Set(testWorkflowData.connections.values()),
			),
		).toStrictEqual(new Set([connection4.id]));
	});
});
