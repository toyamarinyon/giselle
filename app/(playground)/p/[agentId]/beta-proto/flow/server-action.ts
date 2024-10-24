"use server";

import { agents, db } from "@/drizzle";
import { eq } from "drizzle-orm";
import type { Artifact } from "../artifact/types";
import { type StructuredData, fileStatuses } from "../files/types";
import {
	giselleNodeArchetypes,
	textGeneratorParameterNames,
} from "../giselle-node/blueprints";
import {
	type GiselleNode,
	type GiselleNodeId,
	giselleNodeCategories,
} from "../giselle-node/types";
import type { Graph } from "../graph/types";
import type { TextContent } from "../text-content/types";
import type { AgentId } from "../types";
import {
	type WebSearchItem,
	type WebSearchItemReference,
	webSearchItemStatus,
	webSearchStatus,
} from "../web-search/types";
import { type FlowAction, type FlowActionId, flowStatuses } from "./types";

type Source = Artifact | TextContent | StructuredData | WebSearchItem;
interface GatherInstructionSourcesInput {
	node: GiselleNode;
	graph: Graph;
}
async function gatherInstructionSources(input: GatherInstructionSourcesInput) {
	if (!Array.isArray(input.node.properties.sources)) {
		return [];
	}
	const instructionSources: Source[] = [];
	for (const source of input.node.properties.sources) {
		if (
			typeof source !== "object" ||
			source === null ||
			typeof source.id !== "string" ||
			typeof source.object !== "string"
		) {
			continue;
		}
		if (source.object === "textContent") {
			instructionSources.push(source);
		} else if (source.object === "artifact.reference") {
			const artifact = input.graph.artifacts.find(
				(artifact) => artifact.id === source.id,
			);
			if (artifact !== undefined) {
				instructionSources.push(artifact);
			}
		} else if (source.object === "file") {
			if (
				typeof source.status === "string" &&
				source.status === fileStatuses.processed &&
				typeof source.structuredDataBlobUrl === "string" &&
				typeof source.name === "string"
			) {
				const structuredData = await fetch(source.structuredDataBlobUrl).then(
					(res) => res.text(),
				);
				instructionSources.push({
					id: source.id,
					object: "file",
					title: source.name,
					content: structuredData,
				});
			}
		} else if (source.object === "webSearch") {
			if (
				typeof source.status === "string" &&
				source.status === webSearchStatus.completed &&
				Array.isArray(source.items)
			) {
				await Promise.all(
					(source.items as WebSearchItemReference[]).map(async (item) => {
						if (item.status === webSearchItemStatus.completed) {
							const webSearchData = await fetch(item.contentBlobUrl).then(
								(res) => res.text(),
							);
							instructionSources.push({
								id: item.id,
								object: "webSearch.item",
								url: item.url,
								title: item.title,
								content: webSearchData,
								relevance: item.relevance,
							});
						}
					}),
				);
			}
		}
	}
	return instructionSources;
}

interface RunActionInput {
	agentId: AgentId;
	actionId: FlowActionId;
}
export async function runAction(input: RunActionInput) {
	console.log("runAction");
	const agent = await db.query.agents.findFirst({
		where: eq(agents.id, input.agentId),
	});
	if (agent === undefined) {
		throw new Error(`Agent with id ${input.agentId} not found`);
	}
	const graph = agent.graphv2;
	if (graph.flow?.status !== flowStatuses.running) {
		throw new Error(`Agent with id ${input.agentId} is not running`);
	}

	let action: FlowAction | undefined;
	for (const actionLayer of graph.flow.actionLayers) {
		action = actionLayer.actions.find((action) => action.id === input.actionId);
		if (action !== null) {
			break;
		}
	}
	if (action === undefined) {
		throw new Error(`Action with id ${input.actionId} not found`);
	}

	const instructionConnector = graph.connectors.find(
		(connector) =>
			connector.target === action.nodeId &&
			connector.sourceNodeCategory === giselleNodeCategories.instruction,
	);

	if (instructionConnector === undefined) {
		throw new Error(
			`No instruction connector found for node ${input.actionId}`,
		);
	}

	const instructionNode = graph.nodes.find(
		(node) => node.id === instructionConnector.source,
	);
	const actionNode = graph.nodes.find(
		(node) => node.id === instructionConnector.target,
	);

	if (instructionNode === undefined || actionNode === undefined) {
		throw new Error(
			`Instruction node ${instructionConnector.source} or action node ${instructionConnector.target} not found`,
		);
	}

	const sources = await gatherInstructionSources({
		node: instructionNode,
		graph,
	});

	switch (instructionConnector.targetNodeArcheType) {
		case giselleNodeArchetypes.textGenerator:
			await generateText();
			break;
		case giselleNodeArchetypes.webSearch:
			await webSearch();
			break;
	}
	await db.update(agents).set({
		graphv2: {
			...graph,
		},
	});
}

async function generateText() {
	console.log(
		"\x1b[33m\x1b[1mTODO:\x1b[0m Implement text generation functionality",
	);
}

async function webSearch() {
	console.log("\x1b[33m\x1b[1mTODO:\x1b[0m Implement websearch functionality");
}
