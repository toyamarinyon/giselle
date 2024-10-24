"use server";

import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { UnstructuredClient } from "unstructured-client";

import { getUserSubscriptionId, isRoute06User } from "@/app/(auth)/lib";
import { agents, db } from "@/drizzle";
import { metrics } from "@opentelemetry/api";
import { createId } from "@paralleldrive/cuid2";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { Langfuse } from "langfuse";
import { Strategy } from "unstructured-client/sdk/models/shared";
import { schema as artifactSchema } from "../artifact/schema";
import type { FileId } from "../files/types";
import type { AgentId } from "../types";
import { elementsToMarkdown } from "../utils/unstructured";
import type { Graph } from "./types";

type GenerateArtifactStreamParams = {
	userPrompt: string;
	systemPrompt?: string;
};
export async function generateArtifactStream(
	params: GenerateArtifactStreamParams,
) {
	const lf = new Langfuse();
	const trace = lf.trace({
		id: `giselle-${Date.now()}`,
	});
	const stream = createStreamableValue();

	(async () => {
		const model = "gpt-4o-mini";
		const generation = trace.generation({
			input: params.userPrompt,
			model,
		});
		const { partialObjectStream, object } = await streamObject({
			model: openai(model),
			system: params.systemPrompt ?? "You generate an answer to a question. ",
			prompt: params.userPrompt,
			schema: artifactSchema,
			onFinish: async (result) => {
				const meter = metrics.getMeter("OpenAI");
				const tokenCounter = meter.createCounter("token_consumed", {
					description: "Number of OpenAI API tokens consumed by each request",
				});
				const subscriptionId = await getUserSubscriptionId();
				const isR06User = await isRoute06User();
				tokenCounter.add(result.usage.totalTokens, {
					subscriptionId,
					isR06User,
				});
				generation.end({
					output: result,
				});
				await lf.shutdownAsync();
			},
		});

		for await (const partialObject of partialObjectStream) {
			stream.update(partialObject);
		}

		const result = await object;

		stream.done();
	})();

	return { object: stream.value };
}

export async function setGraphToDb(agentId: AgentId, graph: Graph) {
	await db
		.update(agents)
		.set({ graphv2: graph, graphHash: createId() })
		.where(eq(agents.id, agentId));
}

type UploadFileArgs = {
	fileId: FileId;
	file: File;
};
export async function uploadFile(args: UploadFileArgs) {
	const blob = await put(`files/${args.fileId}/${args.file.name}`, args.file, {
		access: "public",
		contentType: args.file.type,
	});
	return blob;
}

type ParseFileArgs = {
	id: FileId;
	name: string;
	blobUrl: string;
};
export async function parseFile(args: ParseFileArgs) {
	if (process.env.UNSTRUCTURED_API_KEY === undefined) {
		throw new Error("UNSTRUCTURED_API_KEY is not set");
	}
	const client = new UnstructuredClient({
		security: {
			apiKeyAuth: process.env.UNSTRUCTURED_API_KEY,
		},
	});
	const response = await fetch(args.blobUrl);
	const content = await response.blob();
	const partitionReponse = await client.general.partition({
		partitionParameters: {
			files: {
				fileName: args.name,
				content,
			},
			strategy: Strategy.Fast,
			splitPdfPage: false,
			splitPdfConcurrencyLevel: 1,
		},
	});
	if (partitionReponse.statusCode !== 200) {
		console.error(partitionReponse.rawResponse);
		throw new Error(`Failed to parse file: ${partitionReponse.statusCode}`);
	}
	const jsonString = JSON.stringify(partitionReponse.elements, null, 2);
	const blob = new Blob([jsonString], { type: "application/json" });

	await put(`files/${args.id}/partition.json`, blob, {
		access: "public",
		contentType: blob.type,
	});

	const markdown = elementsToMarkdown(partitionReponse.elements ?? []);
	const markdownBlob = new Blob([markdown], { type: "text/markdown" });
	const vercelBlob = await put(`files/${args.id}/markdown.md`, markdownBlob, {
		access: "public",
		contentType: markdownBlob.type,
	});

	return vercelBlob;
}
