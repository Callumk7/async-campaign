import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "~/components/ui/link";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/users/$userId/characters")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const playerId = params.userId as Id<"users">;
		await context.queryClient.ensureQueryData(
			convexQuery(api.characters.getCharactersByPlayer, { playerId }),
		);
	},
});

function RouteComponent() {
	const userId = Route.useParams().userId as Id<"users">;
	const { data: characters } = useSuspenseQuery(
		convexQuery(api.characters.getCharactersByPlayer, { playerId: userId }),
	);

	return (
		<main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
			<div>
				<Link to="/users">← Back to users</Link>
				<h1 className="mt-4 text-3xl font-bold">Characters</h1>
				<p className="">
					Characters are now created inside a campaign after a user has been
					added to that campaign.
				</p>
			</div>

			{characters.length === 0 ? (
				<p className="rounded border border-dashed p-4 text-sm">
					This user has not created any campaign characters yet.
				</p>
			) : (
				<ul className="flex flex-col gap-3">
					{characters.map((character) => (
						<li key={character._id} className="rounded border p-4 shadow-sm">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="font-medium">{character.name}</p>
									<p className="text-sm">
										{character.description || "No description."}
									</p>
								</div>
								<Link
									to="/campaigns/$campaignId"
									params={{ campaignId: character.campaignId }}
								>
									Open campaign
								</Link>
							</div>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
