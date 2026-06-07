import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/button";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface CreateQuestFormProps {
	campaignId: Id<"campaigns">;
}

export function CreateQuestForm({ campaignId }: CreateQuestFormProps) {
	const [name, setName] = React.useState("");
	const [description, setDescription] = React.useState("");

	const createQuest = useMutation({
		mutationFn: useConvexMutation(api.quests.createQuest),
	});

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		await createQuest.mutateAsync(
			{
				campaignId,
				name,
				description,
			},
			{
				onSuccess: () => {
					setName("");
					setDescription("");
				},
			},
		);
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="space-y-4 max-w-xl">
				<Field>
					<FieldLabel>Name</FieldLabel>
					<Input value={name} onChange={(e) => setName(e.target.value)} />
				</Field>
				<Field>
					<FieldLabel>Description</FieldLabel>
					<Textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</Field>
				<Button type="submit">Create</Button>
			</div>
		</form>
	);
}
