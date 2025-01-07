export type NodeId = `nd_${string}`;
export type NodeHandleId = `ndh_${string}`;

// Common base types
export interface Position {
	x: number;
	y: number;
}

export interface NodeHandle {
	id: NodeHandleId;
	label: string;
}

// Base node structure
interface NodeBase {
	id: NodeId;
	name: string;
	position: Position;
	selected?: boolean;
}

// Action Types
export interface TextGenerationContent {
	type: "textGeneration";
	llm: `${string}:${string}`;
	temperature: number;
	topP: number;
	instruction: string;
	requirement?: NodeHandle;
	system?: string;
	sources: NodeHandle[];
}

export interface WebSearchContent {
	type: "webSearch";
}

export type ActionContent = TextGenerationContent | WebSearchContent;

// Variable Types
export interface TextContent {
	type: "text";
	text: string;
}

export type FileId = `fl_${string}`;
export interface FileData {
	id: FileId;
	name: string;
	contentType: string;
	size: number;
	status: "uploading" | "processing" | "completed" | "failed";
	uploadedAt?: number;
	fileBlobUrl?: string;
	processedAt?: number;
	textDataUrl?: string;
}

export interface FilesContent {
	type: "files";
	data: FileData[];
}

export type VariableContent = TextContent | FilesContent;

// Node types
export type ActionNode = NodeBase & {
	type: "action";
	content: ActionContent;
};

export type VariableNode = NodeBase & {
	type: "variable";
	content: VariableContent;
};

export type Node = ActionNode | VariableNode;

// Helper type for node creation
export type CreateNodeParams = Omit<Node, "id">;
