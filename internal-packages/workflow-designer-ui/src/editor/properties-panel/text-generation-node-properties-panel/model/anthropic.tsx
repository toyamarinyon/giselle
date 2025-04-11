import { AnthropicLanguageModelData } from "@giselle-sdk/data-type";
import { anthropicLanguageModels } from "@giselle-sdk/language-model";
import { useUsageLimits } from "giselle-sdk/react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../../ui/select";
import { Slider } from "../../../../ui/slider";
import { Switch } from "../../../../ui/switch";
import { languageModelAvailable } from "./utils";

export function AnthropicModelPanel({
	anthropicLanguageModel,
	onModelChange,
}: {
	anthropicLanguageModel: AnthropicLanguageModelData;
	onModelChange: (changedValue: AnthropicLanguageModelData) => void;
}) {
	const limits = useUsageLimits();

	return (
		<div className="flex flex-col gap-[34px]">
			<Select
				value={anthropicLanguageModel.id}
				onValueChange={(value) => {
					onModelChange(
						AnthropicLanguageModelData.parse({
							...anthropicLanguageModel,
							id: value,
						}),
					);
				}}
			>
				<SelectTrigger>
					<SelectValue placeholder="Select a LLM" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{anthropicLanguageModels.map((anthropicLanguageModel) => (
							<SelectItem
								key={anthropicLanguageModel.id}
								value={anthropicLanguageModel.id}
								disabled={
									!languageModelAvailable(anthropicLanguageModel, limits)
								}
							>
								{anthropicLanguageModel.id}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<div>
				<div className="grid grid-cols-2 gap-[24px]">
					<Slider
						label="Temperature"
						value={anthropicLanguageModel.configurations.temperature}
						max={2.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								AnthropicLanguageModelData.parse({
									...anthropicLanguageModel,
									configurations: {
										...anthropicLanguageModel.configurations,
										temperature: value,
									},
								}),
							);
						}}
					/>
					<Slider
						label="Top P"
						value={anthropicLanguageModel.configurations.topP}
						max={1.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								AnthropicLanguageModelData.parse({
									...anthropicLanguageModel,
									configurations: {
										...anthropicLanguageModel.configurations,
										topP: value,
									},
								}),
							);
						}}
					/>

					<Switch
						label="Reasoning"
						name="reasoning"
						checked={anthropicLanguageModel.configurations.reasoning}
						onCheckedChange={(checked) => {
							onModelChange(
								AnthropicLanguageModelData.parse({
									...anthropicLanguageModel,
									configurations: {
										...anthropicLanguageModel.configurations,
										reasoning: checked,
									},
								}),
							);
						}}
					/>
				</div>
			</div>
		</div>
	);
}
