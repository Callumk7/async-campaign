import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useAuth } from "~/components/auth/auth-provider";
import { Authenticated } from "~/components/auth/autheticated";
import { Button } from "~/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Link } from "~/components/ui/link";
import { Textarea } from "~/components/ui/textarea";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/campaigns/$campaignId/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { campaignId: campaignIdParam } = Route.useParams();
	const campaignId = campaignIdParam as Id<"campaigns">;
	const { selectedCharacter, selectCharacter, selectedUserId } = useAuth();
	const [name, setName] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);

	const campaignQuery = convexQuery(api.campaigns.getCampaign, {
		id: campaignId,
	});
	const charactersQuery = convexQuery(
		api.characters.getCharactersByPlayerAndCampaign,
		selectedUserId ? { playerId: selectedUserId, campaignId } : "skip",
	);
	const membershipQuery = convexQuery(
		api.campaignMembers.getCampaignMemberByCampaignAndUser,
		selectedUserId ? { campaignId, userId: selectedUserId } : "skip",
	);
	const { data: campaign } = useQuery(campaignQuery);
	const { data: membership } = useQuery(membershipQuery);
	const { data: characters, isLoading: isCharactersLoading } =
		useQuery(charactersQuery);
	const createCharacter = useMutation({
		mutationFn: useConvexMutation(api.characters.createCharacter),
	});
	const selectCampaignCharacter = useMutation({
		mutationFn: useConvexMutation(
			api.campaignMembers.selectCharacterForCampaign,
		),
	});

	const selectedCharacterBelongsToCampaign =
		selectedCharacter?.campaignId === campaignId;
	const playerCharacters = characters ?? [];

	const handleSelectCharacter = React.useCallback(
		async (character: Doc<"characters">) => {
			if (!selectedUserId) return;
			setError(null);

			try {
				const result = await selectCampaignCharacter.mutateAsync({
					campaignId,
					characterId: character._id,
					userId: selectedUserId,
				});

				selectCharacter(result.character);
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: membershipQuery.queryKey }),
					queryClient.invalidateQueries({ queryKey: campaignQuery.queryKey }),
				]);
				void navigate({
					to: "/campaigns/$campaignId",
					params: { campaignId },
				});
			} catch (caughtError) {
				setError(
					caughtError instanceof Error
						? caughtError.message
						: "Failed to select character.",
				);
			}
		},
		[
			campaignId,
			campaignQuery.queryKey,
			membershipQuery.queryKey,
			navigate,
			queryClient,
			selectCampaignCharacter,
			selectCharacter,
			selectedUserId,
		],
	);

	return (
		<Authenticated>
			<main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
				<div>
					<Link to="/campaigns/$campaignId" params={{ campaignId }}>
						← Back to campaign
					</Link>
					<h1 className="mt-4 text-3xl font-bold">Choose your character</h1>
					<p className="text-sm">
						{campaign
							? `Create or select who you will play in ${campaign.name}.`
							: "Create or select who you will play in this campaign."}
					</p>
				</div>

				{membership === null ? (
					<p className="rounded border p-3">
						You are not a member of this campaign yet. Ask an admin to add you
						before creating a character.
					</p>
				) : null}

				{selectedCharacterBelongsToCampaign ? (
					<p className="rounded border p-3">
						Current character: {selectedCharacter.name}
					</p>
				) : null}

				{membership?.activeCharacterId &&
				!selectedCharacterBelongsToCampaign ? (
					<p className="rounded border p-3">
						You already have a character selected for this campaign. Choose a
						character below to update this browser session.
					</p>
				) : null}

				{error ? (
					<FieldError className="rounded border p-3">{error}</FieldError>
				) : null}

				<section className="rounded-xl border p-5 shadow-sm">
					<h2 className="text-xl font-semibold">Create a campaign character</h2>
					<form
						onSubmit={async (event) => {
							event.preventDefault();
							if (!selectedUserId || !name.trim()) return;
							setError(null);
							try {
								const characterId = await createCharacter.mutateAsync({
									campaignId,
									playerId: selectedUserId,
									name: name.trim(),
									description: emptyToUndefined(description),
								});
								const result = await selectCampaignCharacter.mutateAsync({
									campaignId,
									userId: selectedUserId,
									characterId,
								});
								selectCharacter(result.character);
								setName("");
								setDescription("");
								await queryClient.invalidateQueries({
									queryKey: charactersQuery.queryKey,
								});
								void navigate({
									to: "/campaigns/$campaignId",
									params: { campaignId },
								});
							} catch (caughtError) {
								setError(
									caughtError instanceof Error
										? caughtError.message
										: "Failed to create character.",
								);
							}
						}}
						className="flex flex-col gap-4"
					>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="character-name">Name</FieldLabel>
								<Input
									id="character-name"
									value={name}
									onChange={(event) => setName(event.target.value)}
									disabled={!membership}
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="character-description">
									Description
								</FieldLabel>
								<Textarea
									id="character-description"
									value={description}
									onChange={(event) => setDescription(event.target.value)}
									disabled={!membership}
								/>
							</Field>
						</FieldGroup>
						<Button
							type="submit"
							disabled={
								!membership ||
								createCharacter.isPending ||
								selectCampaignCharacter.isPending
							}
						>
							{createCharacter.isPending ? "Creating..." : "Create and play"}
						</Button>
					</form>
				</section>

				<section className="rounded-xl border p-5 shadow-sm">
					<h2 className="text-xl font-semibold">Your campaign characters</h2>
					{isCharactersLoading ? <p>Loading characters...</p> : null}
					{!isCharactersLoading && playerCharacters.length === 0 ? (
						<p className="text-sm">
							You do not have any characters in this campaign yet.
						</p>
					) : (
						<ul className="flex flex-col gap-2">
							{playerCharacters.map((character) => (
								<li
									key={character._id}
									className="flex items-center justify-between gap-3 rounded border p-3"
								>
									<div>
										<p className="font-medium">{character.name}</p>
										<p className="text-sm">
											{character.description || "No description."}
										</p>
									</div>
									<Button
										type="button"
										disabled={selectCampaignCharacter.isPending}
										onClick={() => void handleSelectCharacter(character)}
									>
										{membership?.activeCharacterId === character._id
											? "Use again"
											: "Play"}
									</Button>
								</li>
							))}
						</ul>
					)}
				</section>
			</main>
		</Authenticated>
	);
}

function emptyToUndefined(value: string) {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}
