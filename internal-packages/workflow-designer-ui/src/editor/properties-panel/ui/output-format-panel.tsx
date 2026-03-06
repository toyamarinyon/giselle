import { Button } from "@giselle-internal/ui/button";
import { Select } from "@giselle-internal/ui/select";
import type { Schema, TextGenerationContent } from "@giselles-ai/protocol";
import { Braces, Plus } from "lucide-react";
import { StructuredOutputDialog } from "../structured-output/structured-output-dialog";

const outputFormatOptions = [
	{ value: "text", label: "Text" },
	{ value: "object", label: "JSON" },
];

const defaultSchema: Schema = {
	title: "response",
	type: "object",
	properties: {},
	required: [],
	additionalProperties: false,
};

type Output = TextGenerationContent["output"];

export function OutputFormatPanel({
	output,
	onOutputChange,
}: {
	output: Output;
	onOutputChange: (output: Output) => void;
}) {
	const hasOutputSchema = output.format === "object";
	const schemaObject = hasOutputSchema ? output.schema : defaultSchema;
	const isSchemaConfigured = Object.keys(schemaObject.properties).length > 0;

	return (
		<div className="flex flex-col items-end gap-[16px]">
			<Select
				options={outputFormatOptions}
				placeholder="Select format"
				value={output.format}
				onValueChange={(value) => {
					if (value === "object") {
						const schema = hasOutputSchema ? output.schema : defaultSchema;
						onOutputChange({ format: "object", schema });
					} else {
						onOutputChange({ format: "text" });
					}
				}}
				widthClassName="w-[100px]"
			/>
			{hasOutputSchema && (
				<div>
					<StructuredOutputDialog
						schema={schemaObject}
						onUpdate={(schema) => onOutputChange({ format: "object", schema })}
						trigger={
							isSchemaConfigured ? (
								<Button
									variant="solid"
									size="large"
									leftIcon={<Braces className="text-blue-300" />}
								>
									{schemaObject.title}
								</Button>
							) : (
								<Button variant="solid" size="large" leftIcon={<Plus />}>
									Set Schema
								</Button>
							)
						}
					/>
				</div>
			)}
		</div>
	);
}
