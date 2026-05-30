import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useAuth } from "#/components/auth/auth-provider";
import { Authenticated } from "#/components/auth/autheticated";
import { Button } from "#/components/ui/button";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/campaigns/$campaignId/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { campaignId: campaignIdParam } = Route.useParams();
	const campaignId = campaignIdParam as Id<"campaigns">;
	const { selectedCharacter, selectCharacter, selectedUserId } = useAuth();
	const addCharacterToCampaign = useMutation({
		mutationFn: useConvexMutation(api.campaignMembers.addCharacterToCampaign),
	});

	const playerCharactersQuery = useQuery(
		convexQuery(
			api.characters.getCharactersByPlayer,
			selectedUserId ? { playerId: selectedUserId } : "skip",
		),
	);

	const playerCharacters = playerCharactersQuery.data ?? [];
	const selectedCharacterBelongsToCampaign =
		selectedCharacter?.campaignId === campaignId;

	const handleSelectCharacter = React.useCallback(
		async (character: Doc<"characters">) => {
			if (!selectedUserId) return;

			const result = await addCharacterToCampaign.mutateAsync({
				campaignId,
				characterId: character._id,
				userId: selectedUserId,
				role: "player",
			});

			selectCharacter(result.character);
			void navigate({
				to: "/campaigns/$campaignId",
				params: { campaignId },
			});
		},
		[
			selectCharacter,
			navigate,
			campaignId,
			selectedUserId,
			addCharacterToCampaign,
		],
	);

	return (
		<Authenticated>
			<main className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
				<div>
					<h1 className="text-3xl font-bold">Select a character</h1>
					<p className="text-sm text-slate-600">
						Choose one of your characters to add to this campaign and use for
						this session.
					</p>
				</div>

				{selectedCharacterBelongsToCampaign ? (
					<p className="rounded border border-green-200 bg-green-50 p-3 text-green-700">
						Current character: {selectedCharacter.name}
					</p>
				) : null}

				{selectedCharacter && !selectedCharacterBelongsToCampaign ? (
					<p className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-700">
						Your current character, {selectedCharacter.name}, has not been added
						to this campaign yet. Choose it below to add it.
					</p>
				) : null}

				{addCharacterToCampaign.error ? (
					<p className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
						{addCharacterToCampaign.error instanceof Error
							? addCharacterToCampaign.error.message
							: "Failed to add character to campaign."}
					</p>
				) : null}

				{playerCharactersQuery.isLoading ? <p>Loading characters...</p> : null}

				{!playerCharactersQuery.isLoading && playerCharacters.length === 0 ? (
					<p>You do not have any characters yet.</p>
				) : (
					<ul className="flex flex-col gap-2">
						{playerCharacters.map((character) => {
							const isInCampaign = character.campaignId === campaignId;
							return (
								<li key={character._id}>
									<Button
										type="button"
										disabled={addCharacterToCampaign.isPending}
										onClick={() => void handleSelectCharacter(character)}
									>
										{isInCampaign ? "Use" : "Add"} {character.name}
									</Button>
								</li>
							);
						})}
					</ul>
				)}
			</main>
		</Authenticated>
	);
}
