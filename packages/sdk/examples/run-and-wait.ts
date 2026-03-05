import Giselle from "@giselles-ai/sdk";
import { z } from "zod";

const client = new Giselle({
	apiKey: process.env.GISELLE_API_KEY,
});

// With schema: task.output is typed as { name: string, age: number }
const { task } = await client.apps.runAndWait({
	appId: "<your-app-id>",
	input: { text: "Hello, Giselle!" },
	schema: z.object({
		name: z.string(),
		age: z.number(),
	}),
});

if (task.outputType === "object") {
	console.log(task.output.name);
	console.log(task.output.age);
}

console.log("Status:", task.status);
console.log("Task:", JSON.stringify(task, null, 2));
