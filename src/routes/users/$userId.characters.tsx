import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Button } from "#/components/ui/button";
import { Field, Form, Label } from "#/components/ui/form";
import { Input } from "#/components/ui/input";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/users/$userId/characters")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const playerId = params.userId as Id<"users">;
		await context.queryClient.ensureQueryData(
			convexQuery(api.characters.getCharactersByPlayer, {
				playerId,
			}),
		);
	},
});

function RouteComponent() {
	const userId = Route.useParams().userId as Id<"users">;
	const [name, setName] = React.useState("");

	const { data: characters } = useSuspenseQuery(
		convexQuery(api.characters.getCharactersByPlayer, { playerId: userId }),
	);
	const createCharacter = useMutation({
		mutationFn: useConvexMutation(api.characters.createCharacter),
	});

	// TODO: handle navigation and confirmation
	const handleCreateCharacter = async (
		e: React.ChangeEvent<HTMLFormElement>,
	) => {
		e.preventDefault();
		await createCharacter.mutateAsync({
			playerId: userId,
			name,
		});
	};

	return (
		<div className="flex flex-col gap-6 p-6">
			<Form className="max-w-2xl" onSubmit={handleCreateCharacter}>
				<Field>
					<Label>Character Name</Label>
					<Input
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</Field>
				<Button type="submit">Create Character</Button>
			</Form>
			<div className="flex flex-col gap-3">
				{characters.map((char) => (
					<div key={char._id}>{char.name}</div>
				))}
			</div>
		</div>
	);
}
