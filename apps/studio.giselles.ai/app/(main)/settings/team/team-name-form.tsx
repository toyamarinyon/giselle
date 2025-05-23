"use client";

import { Card } from "@/app/(main)/settings/components/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Team } from "@/services/teams/types";
import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import {
	type InferInput,
	maxLength,
	minLength,
	parse,
	pipe,
	string,
} from "valibot";
import { updateTeamName } from "./actions";

const TeamNameSchema = pipe(
	string(),
	minLength(1, "Team name is required"),
	maxLength(256, "Team name must be 256 characters or less"),
);

type TeamNameSchema = InferInput<typeof TeamNameSchema>;

export function TeamNameForm({ id: teamId, name }: Team) {
	const [isEditingName, setIsEditingName] = useState(false);
	const [teamName, setTeamName] = useState(name);
	const [tempTeamName, setTempTeamName] = useState(teamName);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string>("");

	const handleSaveTeamName = async () => {
		setError("");

		try {
			const validatedName = parse(TeamNameSchema, tempTeamName);

			setIsLoading(true);

			const formData = new FormData();
			formData.append("name", validatedName);
			const formAction = updateTeamName.bind(null, teamId);
			const result = await formAction(formData);

			if (result.success) {
				setTeamName(validatedName);
				setIsEditingName(false);
			} else {
				setError("Failed to update team name");
				console.error("Failed to update team name");
			}
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			}
			console.error("Error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelTeamName = () => {
		setTempTeamName(teamName);
		setIsEditingName(false);
		setError("");
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setError("");
		setTempTeamName(e.target.value);
	};

	return (
		<Card title="Team name">
			<div className="flex flex-col gap-2">
				<div>
					{isEditingName ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleSaveTeamName();
							}}
							className="flex items-center gap-2"
						>
							<Input
								value={tempTeamName}
								onChange={handleChange}
								className="w-full"
								disabled={isLoading}
							/>
							<Button
								type="submit"
								className="shrink-0 h-8 w-8 rounded-full p-0"
								onClick={handleSaveTeamName}
								disabled={isLoading || !!error}
							>
								<Check className="h-4 w-4" />
							</Button>
							<Button
								type="button"
								className="shrink-0 h-8 w-8 rounded-full p-0"
								onClick={handleCancelTeamName}
								disabled={isLoading}
							>
								<X className="h-4 w-4" />
							</Button>
						</form>
					) : (
						<div className="flex items-center gap-2">
							<span className="text-lg">{teamName}</span>
							<Button
								className="shrink-0 h-8 w-8 rounded-full p-0"
								onClick={() => setIsEditingName(true)}
							>
								<Pencil className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>

				{error && <p className="text-sm text-red-600">{error}</p>}
			</div>
		</Card>
	);
}
