import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/components/auth/auth-provider";
import { Authenticated } from "~/components/auth/autheticated";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Link } from "~/components/ui/link";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/campaigns/$campaignId/")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			convexQuery(api.campaigns.getCampaignWithChildren, {
				id: params.campaignId as Id<"campaigns">,
			}),
		);
	},
});

function RouteComponent() {
	const params = Route.useParams();
	const campaignId = params.campaignId as Id<"campaigns">;
	const { selectedUser, selectedUserId } = useAuth();
	const { data } = useSuspenseQuery(
		convexQuery(api.campaigns.getCampaignWithChildren, { id: campaignId }),
	);

	if (!data) {
		return (
			<Authenticated>
				<main className="mx-auto max-w-3xl p-8">
					<Link to="/campaigns">← Back to campaigns</Link>
					<h1 className="mt-4 text-3xl font-bold">Campaign not found</h1>
				</main>
			</Authenticated>
		);
	}

	const currentMembership = data.membersWithUsers.find(
		(row) => row.membership.userId === selectedUserId,
	);
	const canManage =
		selectedUser?.role === "admin" ||
		data.campaign.ownerId === selectedUserId ||
		currentMembership?.membership.role === "admin" ||
		currentMembership?.membership.role === "dm";

	// TODO: Fix up this markup

	return (
		<Authenticated>
			<main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
				<Card>
					<CardHeader>
						<div className="flex flex-wrap items-start justify-between gap-4">
							<CardTitle>{data.campaign.name}</CardTitle>
							<Link to="/campaigns">← Back to campaigns</Link>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div>
								<p className="mt-2 max-w-2xl">
									{data.campaign.description || "No description yet."}
								</p>
							</div>
							<Badge>{data.campaign.status ?? "active"}</Badge>
						</div>
					</CardContent>
				</Card>

				<div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
					<Card>
						<CardHeader>
							<CardTitle>Your seat</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-4">
							{currentMembership ? (
								<>
									<p className="text-sm">
										You are in this campaign as{" "}
										{currentMembership.membership.role}.
									</p>
									{currentMembership.activeCharacter ? (
										<div className="rounded-lg border p-4">
											<p className="text-sm">Playing as</p>
											<p className="font-semibold">
												{currentMembership.activeCharacter.name}
											</p>
										</div>
									) : (
										<p className="rounded-lg border p-4 text-sm">
											Select a character before playing in this campaign.
										</p>
									)}
									<Link
										variant="default"
										to="/campaigns/$campaignId/login"
										params={{ campaignId }}
									>
										Create or choose character
									</Link>
								</>
							) : (
								<p className="rounded-lg border p-4 text-sm">
									Ask a campaign admin to add you before creating a character.
								</p>
							)}
							{canManage ? (
								<Link to="/campaigns/$campaignId/admin" params={{ campaignId }}>
									Manage campaign
								</Link>
							) : null}
						</CardContent>
					</Card>

					<Card>
						<CardContent className="flex flex-col gap-4">
							<div className="flex items-center justify-between gap-3">
								<h2 className="text-xl font-semibold">Roster</h2>
								<span className="text-sm">
									{data.membersWithUsers.length} members ·{""}
									{data.characters.length} characters
								</span>
							</div>
							{data.membersWithUsers.length === 0 ? (
								<p className="text-sm">No users added yet.</p>
							) : (
								<ul className="grid gap-3 md:grid-cols-2">
									{data.membersWithUsers.map((row) => (
										<li
											key={row.membership._id}
											className="rounded-lg border p-3"
										>
											<p className="font-medium">
												{row.user?.name ?? "Deleted user"}
											</p>
											<p className="text-sm">
												{row.membership.role} ·{""}
												{row.activeCharacter?.name ?? "no character selected"}
											</p>
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>
				</div>
			</main>
		</Authenticated>
	);
}
