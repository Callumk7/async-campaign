import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useAuth } from "#/components/auth/auth-provider";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { selectCharacter } = useAuth();
	const createCharacter = useMutation({
		mutationFn: useConvexMutation(api.characters.createCharacter),
	});
	const charactersQuery = useQuery(
		convexQuery(api.characters.getCharacters, {}),
	);
	const [name, setName] = React.useState("");

	return (
		<main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
			<h1 className="text-3xl font-bold">Choose your character</h1>

			<section className="flex flex-col gap-3 rounded border p-4">
				<h2 className="text-xl font-semibold">Existing characters</h2>
				{charactersQuery.isLoading && <p>Loading characters...</p>}
				{charactersQuery.data?.length === 0 && <p>No characters yet.</p>}
				<div className="flex flex-col gap-2">
					{charactersQuery.data?.map((character) => (
						<button
							key={character._id}
							type="button"
							onClick={() => {
								selectCharacter(character);
								void navigate({ to: "/" });
							}}
						>
							{character.name}
						</button>
					))}
				</div>
			</section>

			<section className="flex flex-col gap-3 rounded border p-4">
				<h2 className="text-xl font-semibold">Create a character</h2>
				<form
					className="flex gap-2"
					onSubmit={async (event) => {
						event.preventDefault();
						const trimmedName = name.trim();
						if (!trimmedName) return;

						const characterId = await createCharacter.mutateAsync({
							name: trimmedName,
						});
						selectCharacter({
							_id: characterId,
							_creationTime: Date.now(),
							name: trimmedName,
						});
						setName("");
						void navigate({ to: "/" });
					}}
				>
					<input
						aria-label="Character name"
						placeholder="Character name"
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
					<button type="submit" disabled={createCharacter.isPending}>
						Create character
					</button>
				</form>
				{createCharacter.isPending && <p>Creating character...</p>}
			</section>
		</main>
	);
}
