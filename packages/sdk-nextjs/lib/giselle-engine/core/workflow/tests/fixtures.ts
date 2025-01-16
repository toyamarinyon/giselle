import {
	type NodeData,
	Workspace,
	createConnection,
	createConnectionHandle,
	createWorkspace,
} from "@/lib/giselle-data";
import { createTextGenerationNodeData } from "@/lib/giselle-data/node/actions/text-generation";
import type { NodeId } from "@/lib/giselle-data/node/types";
import { createTextNodeData } from "@/lib/giselle-data/node/variables/text";

export const textGenerationNode1 = createTextGenerationNodeData({
	name: "Text Generation Node 1",
});
export const textGenerationNode2 = createTextGenerationNodeData({
	name: "Text Generation Node 2",
});
export const textGenerationNode3 = createTextGenerationNodeData({
	name: "Text Generation Node 3",
});
export const textNode1 = createTextNodeData({
	name: "Text Node 1",
});
export const connectionHandle1 = createConnectionHandle({
	label: "source",
	nodeId: textGenerationNode1.id,
	nodeType: textGenerationNode1.type,
});
export const connection1 = createConnection({
	sourceNode: textNode1,
	targetNodeHandle: connectionHandle1,
});
export const connectionHandle2 = createConnectionHandle({
	label: "source",
	nodeId: textGenerationNode2.id,
	nodeType: textGenerationNode2.type,
});
export const connection2 = createConnection({
	sourceNode: textGenerationNode1,
	targetNodeHandle: connectionHandle2,
});
export const connectionHandle3 = createConnectionHandle({
	label: "source",
	nodeId: textGenerationNode3.id,
	nodeType: textGenerationNode3.type,
});
export const connection3 = createConnection({
	sourceNode: textGenerationNode2,
	targetNodeHandle: connectionHandle3,
});
export const textGenerationNode4 = createTextGenerationNodeData({
	name: "Text Generation Node 4",
});
export const textGenerationNode5 = createTextGenerationNodeData({
	name: "Text Generation Node 5",
});
export const connectionHandle4 = createConnectionHandle({
	label: "source",
	nodeId: textGenerationNode5.id,
	nodeType: textGenerationNode5.type,
});
export const connection4 = createConnection({
	sourceNode: textGenerationNode4,
	targetNodeHandle: connectionHandle4,
});
export const testWorkspace = Workspace.parse({
	...createWorkspace(),
	nodes: new Map<NodeId, NodeData>([
		[textGenerationNode1.id, textGenerationNode1],
		[textNode1.id, textNode1],
		[textGenerationNode2.id, textGenerationNode2],
		[textGenerationNode3.id, textGenerationNode3],
		[textGenerationNode4.id, textGenerationNode4],
		[textGenerationNode5.id, textGenerationNode5],
	]),
	connections: new Map([
		[connection1.id, connection1],
		[connection2.id, connection2],
		[connection3.id, connection3],
		[connection4.id, connection4],
	]),
});
