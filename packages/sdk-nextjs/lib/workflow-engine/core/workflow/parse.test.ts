import {
	WorkflowData,
	createConnection,
	createConnectionHandle,
	generateInitialWorkflowData,
} from "@/lib/workflow-data";
import { createTextGenerationNodeData } from "@/lib/workflow-data/node/actions/text-generation";
import { createTextNodeData } from "@/lib/workflow-data/node/variables/text";
import { expect, test } from "vitest";
import { createConnectionMap } from "./parse";

test("createConnectionMap", () => {
	const textGenerationNode1 = createTextGenerationNodeData({
		name: "Text Generation Node 1",
	});
	const textNode1 = createTextNodeData({
		name: "Text Node 1",
	});
	const connectionHandle = createConnectionHandle({
		label: "source",
		nodeId: textGenerationNode1.id,
		nodeType: textGenerationNode1.type,
	});
	const connection1 = createConnection({
		sourceNode: textNode1,
		targetNodeHandle: connectionHandle,
	});
	const workflowData = WorkflowData.parse({
		...generateInitialWorkflowData(),
		nodes: new Map(
			Object.entries({
				[textGenerationNode1.id]: textGenerationNode1,
				[textNode1.id]: textNode1,
			}),
		),
		connections: new Map(Object.entries({ [connection1.id]: connection1 })),
	});
	expect(
		createConnectionMap(
			new Set([connection1]),
			new Set([textGenerationNode1.id, textNode1.id]),
		),
	).toStrictEqual(
		new Map([
			[textNode1.id, new Set([textGenerationNode1.id])],
			[textGenerationNode1.id, new Set([textNode1.id])],
		]),
	);
});
