import type { GiselleNode, GiselleNodeId } from "../../giselle-node/types";

const v2NodeActionTypes = {
	updateNode: "v2.updateNode",
} as const;
type V2NodeActionType =
	(typeof v2NodeActionTypes)[keyof typeof v2NodeActionTypes];
export function isV2NodeAction(action: unknown): action is V2NodeAction {
	return Object.values(v2NodeActionTypes).includes(
		(action as V2NodeAction).type,
	);
}
interface UpdateNodeAction {
	type: Extract<V2NodeActionType, "v2.updateNode">;
	input: UpdateNodeInput;
}
interface UpdateNodeInput {
	id: GiselleNodeId;
	isFinal?: boolean;
}
export function updateNode({
	input,
}: { input: UpdateNodeInput }): UpdateNodeAction {
	return {
		type: v2NodeActionTypes.updateNode,
		input,
	};
}

export type V2NodeAction = UpdateNodeAction;

export function v2NodeReducer(
	nodes: GiselleNode[],
	action: V2NodeAction,
): GiselleNode[] {
	switch (action.type) {
		case v2NodeActionTypes.updateNode:
			return nodes.map((node) => {
				if (node.id === action.input.id) {
					return {
						...node,
						isFinal: action.input.isFinal ?? false,
					};
				}
				return node;
			});
	}
	return nodes;
}
