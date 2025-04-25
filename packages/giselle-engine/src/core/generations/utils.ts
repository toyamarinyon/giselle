import { parseAndMod } from "@giselle-sdk/data-mod";
import {
	type CompletedGeneration,
	type FileContent,
	type FileData,
	Generation,
	GenerationContext,
	type GenerationId,
	GenerationIndex,
	type GenerationOrigin,
	type ImageGenerationNode,
	type Node,
	NodeGenerationIndex,
	NodeId,
	type OperationNode,
	OutputId,
	type RunId,
	type TextGenerationNode,
	type WorkspaceId,
} from "@giselle-sdk/data-type";
import { hasTierAccess, languageModels } from "@giselle-sdk/language-model";
import { isJsonContent, jsonContentToText } from "@giselle-sdk/text-editor";
import type { CoreMessage, DataContent, FilePart, ImagePart } from "ai";
import type { Storage } from "unstorage";
import { getRun } from "../runs/utils";
import type { GiselleEngineContext } from "../types";

export interface GeneratedImageData {
	uint8Array: Uint8Array;
	base64: string;
}

export interface FileIndex {
	nodeId: NodeId;
	start: number;
	end: number;
}

export async function buildMessageObject(
	node: OperationNode,
	contextNodes: Node[],
	fileResolver: (file: FileData) => Promise<DataContent>,
	textGenerationResolver: (
		nodeId: NodeId,
		outputId: OutputId,
	) => Promise<string | undefined>,
): Promise<CoreMessage[]> {
	switch (node.content.type) {
		case "textGeneration": {
			return await buildGenerationMessageForTextGeneration(
				node as TextGenerationNode,
				contextNodes,
				fileResolver,
				textGenerationResolver,
			);
		}
		case "imageGeneration": {
			return await buildGenerationMessageForImageGeneration(
				node as ImageGenerationNode,
				contextNodes,
				fileResolver,
				textGenerationResolver,
			);
		}
		case "trigger": {
			return [];
		}
		default: {
			const _exhaustiveCheck: never = node.content;
			throw new Error(`Unhandled content type: ${_exhaustiveCheck}`);
		}
	}
}

async function buildGenerationMessageForTextGeneration(
	node: TextGenerationNode,
	contextNodes: Node[],
	fileResolver: (file: FileData) => Promise<DataContent>,
	textGenerationResolver: (
		nodeId: NodeId,
		outputId: OutputId,
	) => Promise<string | undefined>,
): Promise<CoreMessage[]> {
	const llmProvider = node.content.llm.provider;
	const prompt = node.content.prompt;
	if (prompt === undefined) {
		throw new Error("Prompt cannot be empty");
	}

	let userMessage = prompt;

	if (isJsonContent(prompt)) {
		userMessage = jsonContentToText(JSON.parse(prompt));
	}

	const pattern = /\{\{(nd-[a-zA-Z0-9]+):(otp-[a-zA-Z0-9]+)\}\}/g;
	const sourceKeywords = [...userMessage.matchAll(pattern)].map((match) => ({
		nodeId: NodeId.parse(match[1]),
		outputId: OutputId.parse(match[2]),
	}));

	const attachedFiles: (FilePart | ImagePart)[] = [];
	const attachedFileNodeIds: NodeId[] = [];
	for (const sourceKeyword of sourceKeywords) {
		const contextNode = contextNodes.find(
			(contextNode) => contextNode.id === sourceKeyword.nodeId,
		);
		if (contextNode === undefined) {
			continue;
		}
		const replaceKeyword = `{{${sourceKeyword.nodeId}:${sourceKeyword.outputId}}}`;

		switch (contextNode.content.type) {
			case "text": {
				const jsonOrText = contextNode.content.text;
				const text = isJsonContent(jsonOrText)
					? jsonContentToText(JSON.parse(jsonOrText))
					: jsonOrText;
				userMessage = userMessage.replace(replaceKeyword, text);
				break;
			}
			case "textGeneration": {
				const result = await textGenerationResolver(
					contextNode.id,
					sourceKeyword.outputId,
				);
				if (result !== undefined) {
					userMessage = userMessage.replace(replaceKeyword, result);
				}
				break;
			}
			case "file":
				if (
					attachedFileNodeIds.some(
						(attachedFileNodeId) => contextNode.id === attachedFileNodeId,
					)
				) {
					continue;
				}
				switch (contextNode.content.category) {
					case "text":
					case "image":
					case "pdf": {
						const fileContents = await getFileContents(
							contextNode.content,
							fileResolver,
						);
						userMessage = userMessage.replace(
							replaceKeyword,
							getFilesDescription(attachedFiles.length, fileContents.length),
						);

						attachedFiles.push(...fileContents);
						attachedFileNodeIds.push(contextNode.id);
						break;
					}
					default: {
						const _exhaustiveCheck: never = contextNode.content.category;
						throw new Error(`Unhandled category: ${_exhaustiveCheck}`);
					}
				}
				break;

			case "github":
			case "imageGeneration":
			case "trigger":
				throw new Error("Not implemented");

			default: {
				const _exhaustiveCheck: never = contextNode.content;
				throw new Error(`Unhandled type: ${_exhaustiveCheck}`);
			}
		}
	}

	switch (llmProvider) {
		case "openai": {
			return [
				{
					role: "user",
					content: [
						...attachedFiles,
						{
							type: "text",
							text: userMessage,
						},
					],
				},
			];
		}
		case "anthropic":
		case "google": {
			return [
				{
					role: "user",
					content: [
						...attachedFiles,
						{
							type: "text",
							text: userMessage,
						},
					],
				},
			];
		}
		case "perplexity": {
			return [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: userMessage,
						},
					],
				},
			];
		}
		default: {
			const _exhaustiveCheck: never = llmProvider;
			throw new Error(`Unhandled provider: ${_exhaustiveCheck}`);
		}
	}
}

function getOrdinal(n: number): string {
	const rules = new Intl.PluralRules("en", { type: "ordinal" });
	const suffixes: { [key: string]: string } = {
		one: "st",
		two: "nd",
		few: "rd",
		other: "th",
	};
	const suffix = suffixes[rules.select(n)];
	return `${n}${suffix}`;
}

function generationIndexPath(generationId: GenerationId) {
	return `generations/${generationId}.json`;
}
export async function getGenerationIndex(params: {
	storage: Storage;
	generationId: GenerationId;
}) {
	const unsafeGenerationIndex = await params.storage.getItem(
		generationIndexPath(params.generationId),
	);
	if (unsafeGenerationIndex === null) {
		return undefined;
	}
	return GenerationIndex.parse(unsafeGenerationIndex);
}
export async function setGenerationIndex(params: {
	storage: Storage;
	generationIndex: GenerationIndex;
}) {
	await params.storage.setItem(
		generationIndexPath(params.generationIndex.id),
		GenerationIndex.parse(params.generationIndex),
	);
}
export function generationPath(generationIndex: GenerationIndex) {
	const generationOrigin = generationIndex.origin;
	const originType = generationOrigin.type;
	switch (originType) {
		case "workspace":
			return `workspaces/${generationOrigin.id}/generations/${generationIndex.id}/generation.json`;
		case "run":
			return `runs/${generationOrigin.id}/generations/${generationIndex.id}/generation.json`;
		default: {
			const _exhaustiveCheck: never = originType;
			return _exhaustiveCheck;
		}
	}
}

export function activeNodeGenerationIdPath(
	params: {
		storage: Storage;
		nodeId: NodeId;
	} & { origin: GenerationOrigin },
) {
	switch (params.origin.type) {
		case "workspace":
			return `workspaces/${params.origin.id}/node-generations/${params.nodeId}/activeGenerationId.txt`;
		case "run":
			return `runs/${params.origin.id}/node-generations/${params.nodeId}/activeGenerationId.txt`;
		default: {
			const _exhaustiveCheck: never = params.origin;
			return _exhaustiveCheck;
		}
	}
}

export async function setGeneration(params: {
	storage: Storage;
	generation: Generation;
}) {
	await params.storage.setItem(
		generationPath({
			id: params.generation.id,
			origin: params.generation.context.origin,
		}),
		Generation.parse(params.generation),
		{
			// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
			cacheControlMaxAge: 0,
		},
	);
}

export async function getGeneration(params: {
	storage: Storage;
	generationId: GenerationId;
}): Promise<Generation | undefined> {
	const generationIndex = await getGenerationIndex({
		storage: params.storage,
		generationId: params.generationId,
	});
	if (generationIndex == null) {
		throw new Error("Generation not found");
	}
	const unsafeGeneration = await params.storage.getItem(
		`${generationPath(generationIndex)}`,
		{
			bypassingCache: true,
		},
	);
	return parseAndMod(Generation, unsafeGeneration);
}

export function nodeGenerationIndexPath(
	params: {
		storage: Storage;
		nodeId: NodeId;
	} & { origin: GenerationOrigin },
) {
	switch (params.origin.type) {
		case "workspace":
			return `workspaces/${params.origin.id}/node-generations/${params.nodeId}.json`;
		case "run":
			return `runs/${params.origin.id}/node-generations/${params.nodeId}.json`;
		default: {
			const _exhaustiveCheck: never = params.origin;
			return _exhaustiveCheck;
		}
	}
}
export async function setNodeGenerationIndex(
	params: {
		storage: Storage;
		nodeId: NodeId;
		nodeGenerationIndex: NodeGenerationIndex;
	} & { origin: GenerationOrigin },
) {
	let newNodeGenerationIndexes: NodeGenerationIndex[] | undefined;
	const nodeGenerationIndexes = await getNodeGenerationIndexes({
		storage: params.storage,
		nodeId: params.nodeId,
		origin: params.origin,
	});
	if (nodeGenerationIndexes === undefined) {
		newNodeGenerationIndexes = [params.nodeGenerationIndex];
	} else {
		const index = nodeGenerationIndexes.findIndex(
			(nodeGenerationIndex) =>
				nodeGenerationIndex.id === params.nodeGenerationIndex.id,
		);
		if (index === -1) {
			newNodeGenerationIndexes = [
				...nodeGenerationIndexes,
				params.nodeGenerationIndex,
			];
		} else {
			newNodeGenerationIndexes = [
				...nodeGenerationIndexes.slice(0, index),
				params.nodeGenerationIndex,
				...nodeGenerationIndexes.slice(index + 1),
			];
		}
	}
	await params.storage.setItem(
		nodeGenerationIndexPath(params),
		newNodeGenerationIndexes,
		{
			// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
			cacheControlMaxAge: 0,
		},
	);
}

export async function getNodeGenerationIndexes(
	params: {
		storage: Storage;
		nodeId: NodeId;
	} & { origin: GenerationOrigin },
) {
	const unsafeNodeGenerationIndexData = await params.storage.getItem(
		nodeGenerationIndexPath(params),
	);
	if (unsafeNodeGenerationIndexData === null) {
		return undefined;
	}
	return NodeGenerationIndex.array().parse(unsafeNodeGenerationIndexData);
}

async function getFileContents(
	fileContent: FileContent,
	fileResolver: (file: FileData) => Promise<DataContent>,
): Promise<(FilePart | ImagePart)[]> {
	return await Promise.all(
		fileContent.files.map(async (file) => {
			if (file.status !== "uploaded") {
				return null;
			}
			const data = await fileResolver(file);
			switch (fileContent.category) {
				case "pdf":
				case "text":
					return {
						type: "file",
						data,
						mimeType: file.type,
					} satisfies FilePart;
				case "image":
					return {
						type: "image",
						image: data,
						mimeType: file.type,
					} satisfies ImagePart;
				default: {
					const _exhaustiveCheck: never = fileContent.category;
					throw new Error(`Unhandled file category: ${_exhaustiveCheck}`);
				}
			}
		}),
	).then((results) => results.filter((result) => result !== null));
}

// Helper function for generating the files description
function getFilesDescription(
	currentCount: number,
	newFilesCount: number,
): string {
	if (newFilesCount > 1) {
		return `${getOrdinal(currentCount + 1)} ~ ${getOrdinal(currentCount + newFilesCount)} attached files`;
	}
	return `${getOrdinal(currentCount + 1)} attached file`;
}

export async function getRedirectedUrlAndTitle(url: string) {
	// Make the request with fetch and set redirect to 'follow'
	const response = await fetch(url, {
		redirect: "follow", // This automatically follows redirects
	});

	// Get the final URL after redirects
	const finalUrl = response.url;

	// Get the HTML content
	const html = await response.text();

	// Extract title using a simple regex pattern
	const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
	const title = titleMatch ? titleMatch[1].trim() : "No title found";

	return {
		originalUrl: url,
		redirectedUrl: finalUrl,
		title: title,
	};
}

async function buildGenerationMessageForImageGeneration(
	node: ImageGenerationNode,
	contextNodes: Node[],
	fileResolver: (file: FileData) => Promise<DataContent>,
	textGenerationResolver: (
		nodeId: NodeId,
		outputId: OutputId,
	) => Promise<string | undefined>,
): Promise<CoreMessage[]> {
	const prompt = node.content.prompt;
	if (prompt === undefined) {
		throw new Error("Prompt cannot be empty");
	}

	let userMessage = prompt;

	if (isJsonContent(prompt)) {
		userMessage = jsonContentToText(JSON.parse(prompt));
	}

	const pattern = /\{\{(nd-[a-zA-Z0-9]+):(otp-[a-zA-Z0-9]+)\}\}/g;
	const sourceKeywords = [...userMessage.matchAll(pattern)].map((match) => ({
		nodeId: NodeId.parse(match[1]),
		outputId: OutputId.parse(match[2]),
	}));

	const attachedFiles: (FilePart | ImagePart)[] = [];
	for (const sourceKeyword of sourceKeywords) {
		const contextNode = contextNodes.find(
			(contextNode) => contextNode.id === sourceKeyword.nodeId,
		);
		if (contextNode === undefined) {
			continue;
		}
		const replaceKeyword = `{{${sourceKeyword.nodeId}:${sourceKeyword.outputId}}}`;
		switch (contextNode.content.type) {
			case "text": {
				userMessage = userMessage.replace(
					replaceKeyword,
					contextNode.content.text,
				);
				break;
			}
			case "textGeneration": {
				const result = await textGenerationResolver(
					contextNode.id,
					sourceKeyword.outputId,
				);
				if (result !== undefined) {
					userMessage = userMessage.replace(replaceKeyword, result);
				}
				break;
			}
			case "file":
				switch (contextNode.content.category) {
					case "text":
					case "image":
					case "pdf": {
						const fileContents = await getFileContents(
							contextNode.content,
							fileResolver,
						);
						userMessage = userMessage.replace(
							replaceKeyword,
							getFilesDescription(attachedFiles.length, fileContents.length),
						);

						attachedFiles.push(...fileContents);
						break;
					}
					default: {
						const _exhaustiveCheck: never = contextNode.content.category;
						throw new Error(`Unhandled category: ${_exhaustiveCheck}`);
					}
				}
				break;

			case "github":
			case "imageGeneration":
			case "trigger":
				throw new Error("Not implemented");

			default: {
				const _exhaustiveCheck: never = contextNode.content;
				throw new Error(`Unhandled type: ${_exhaustiveCheck}`);
			}
		}
	}
	return [
		{
			role: "user",
			content: [
				{
					type: "text",
					text: userMessage,
				},
			],
		},
	];
}

export function generatedImagePath(generation: Generation, filename: string) {
	const generationContext = GenerationContext.parse(generation.context);
	const originType = generationContext.origin.type;
	switch (originType) {
		case "workspace":
			return `workspaces/${generation.context.origin.id}/generations/${generation.id}/${filename}`;
		case "run":
			return `runs/${generation.context.origin.id}/generations/${generation.id}/${filename}`;
		default: {
			const _exhaustiveCheck: never = originType;
			return _exhaustiveCheck;
		}
	}
}

export async function setGeneratedImage(params: {
	storage: Storage;
	generation: Generation;
	generatedImageFilename: string;
	generatedImage: GeneratedImageData;
}) {
	await params.storage.setItemRaw(
		generatedImagePath(params.generation, params.generatedImageFilename),
		params.generatedImage.uint8Array,
	);
}

export async function getGeneratedImage(params: {
	storage: Storage;
	generation: Generation;
	filename: string;
}) {
	let image = await params.storage.getItemRaw(
		generatedImagePath(params.generation, params.filename),
	);
	if (image instanceof ArrayBuffer) {
		image = new Uint8Array(image);
	}

	assertUint8Array(image);
	return image;
}

function assertUint8Array(value: unknown): asserts value is Uint8Array {
	if (!(value instanceof Uint8Array)) {
		throw new TypeError(`Expected Uint8Array but got ${typeof value}`);
	}
}

/**
 * Detects if a file is JPEG, PNG, or WebP by examining its header bytes
 * @param imageAsUint8Array The file to check
 * @returns Detected MIME type or null if not recognized
 */
export function detectImageType(
	imageAsUint8Array: Uint8Array<ArrayBufferLike>,
): { contentType: string; ext: string } | null {
	// Get the first 12 bytes of the file (enough for all our formats)
	const bytes = imageAsUint8Array;

	// JPEG: Starts with FF D8 FF
	if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
		return { contentType: "image/jpeg", ext: "jpeg" };
	}

	// PNG: Starts with 89 50 4E 47 0D 0A 1A 0A (hex for \x89PNG\r\n\x1a\n)
	if (
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47 &&
		bytes[4] === 0x0d &&
		bytes[5] === 0x0a &&
		bytes[6] === 0x1a &&
		bytes[7] === 0x0a
	) {
		return { contentType: "image/png", ext: "png" };
	}

	// WebP: Starts with RIFF....WEBP (52 49 46 46 ... 57 45 42 50)
	if (
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46 &&
		bytes[8] === 0x57 &&
		bytes[9] === 0x45 &&
		bytes[10] === 0x42 &&
		bytes[11] === 0x50
	) {
		return { contentType: "image/webp", ext: "webp" };
	}

	// Not a recognized image format
	return null;
}

/**
 * Calculates and records the time consumed by the agent
 */
export async function handleAgentTimeConsumption(args: {
	workspaceId: WorkspaceId;
	generation: CompletedGeneration;
	onConsumeAgentTime?: NonNullable<GiselleEngineContext["onConsumeAgentTime"]>;
}) {
	const { workspaceId, generation, onConsumeAgentTime } = args;

	if (onConsumeAgentTime == null) {
		return;
	}
	const totalDurationMs = generation.completedAt - generation.startedAt;
	await onConsumeAgentTime(
		workspaceId,
		generation.startedAt,
		generation.completedAt,
		totalDurationMs,
	);
}

type CheckUsageLimitsResult = { type: "ok" } | { type: "error"; error: string };

/**
 * Check usage limits for the workspace
 */
export async function checkUsageLimits(args: {
	workspaceId: WorkspaceId;
	generation: Generation;
	fetchUsageLimitsFn?: NonNullable<GiselleEngineContext["fetchUsageLimitsFn"]>;
}): Promise<CheckUsageLimitsResult> {
	const { workspaceId, generation, fetchUsageLimitsFn } = args;
	if (fetchUsageLimitsFn == null) {
		return { type: "ok" };
	}
	const usageLimits = await fetchUsageLimitsFn(workspaceId);

	const generationContext = GenerationContext.parse(generation.context);
	const operationNode = generationContext.operationNode;
	if (operationNode.content.type === "trigger") {
		return { type: "ok" };
	}
	const llm = operationNode.content.llm;
	const languageModel = languageModels.find((model) => model.id === llm.id);
	if (languageModel === undefined) {
		return {
			type: "error",
			error: "Language model not found",
		};
	}
	if (!hasTierAccess(languageModel, usageLimits.featureTier)) {
		return {
			type: "error",
			error:
				"Access denied: insufficient tier for the requested language model.",
		};
	}

	const agentTimeLimits = usageLimits.resourceLimits.agentTime;
	if (agentTimeLimits.used >= agentTimeLimits.limit) {
		return {
			type: "error",
			error:
				"Access denied: insufficient agent time for the requested generation.",
		};
	}
	return { type: "ok" };
}

export async function extractWorkspaceIdFromOrigin(args: {
	storage: GiselleEngineContext["storage"];
	origin: { type: "workspace"; id: WorkspaceId } | { type: "run"; id: RunId };
}) {
	const { origin, storage } = args;

	if (origin.type === "workspace") {
		return origin.id;
	}

	const run = await getRun({
		storage: storage,
		runId: origin.id,
	});

	if (run == null || !("workspaceId" in run)) {
		throw new Error("Run not completed");
	}
	return run.workspaceId;
}
