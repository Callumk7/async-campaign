import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/components/auth/auth-provider";
import { Authenticated } from "~/components/auth/autheticated";
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

	return (
		<Authenticated>
			<main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
				<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<Link to="/campaigns">← Back to campaigns</Link>
							<p className="mt-4 text-sm uppercase tracking-wide text-slate-500">
								Campaign
							</p>
							<h1 className="text-3xl font-bold text-slate-950">
								{data.campaign.name}
							</h1>
							<p className="mt-2 max-w-2xl text-slate-600">
								{data.campaign.description || "No description yet."}
							</p>
						</div>
						<span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
							{data.campaign.status ?? "active"}
						</span>
					</div>
				</section>

				<div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
					<section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
						<h2 className="text-xl font-semibold text-slate-950">Your seat</h2>
						{currentMembership ? (
							<>
								<p className="text-sm text-slate-600">
									You are in this campaign as{" "}
									{currentMembership.membership.role}.
								</p>
								{currentMembership.activeCharacter ? (
									<div className="rounded-lg border border-green-200 bg-green-50 p-4">
										<p className="text-sm text-green-700">Playing as</p>
										<p className="font-semibold text-green-950">
											{currentMembership.activeCharacter.name}
										</p>
									</div>
								) : (
									<p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
										Select a character before playing in this campaign.
									</p>
								)}
								<Link
									to="/campaigns/$campaignId/login"
									params={{ campaignId }}
									className="rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 hover:no-underline"
								>
									Create or choose character
								</Link>
							</>
						) : (
							<p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
								Ask a campaign admin to add you before creating a character.
							</p>
						)}
						{canManage ? (
							<Link to="/campaigns/$campaignId/admin" params={{ campaignId }}>
								Manage campaign
							</Link>
						) : null}
					</section>

					<section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
						<div className="flex items-center justify-between gap-3">
							<h2 className="text-xl font-semibold text-slate-950">Roster</h2>
							<span className="text-sm text-slate-500">
								{data.membersWithUsers.length} members ·{" "}
								{data.characters.length} characters
							</span>
						</div>
						{data.membersWithUsers.length === 0 ? (
							<p className="text-sm text-slate-500">No users added yet.</p>
						) : (
							<ul className="grid gap-3 md:grid-cols-2">
								{data.membersWithUsers.map((row) => (
									<li
										key={row.membership._id}
										className="rounded-lg border border-slate-200 p-3"
									>
										<p className="font-medium text-slate-950">
											{row.user?.name ?? "Deleted user"}
										</p>
										<p className="text-sm text-slate-500">
											{row.membership.role} ·{" "}
											{row.activeCharacter?.name ?? "no character selected"}
										</p>
									</li>
								))}
							</ul>
						)}
					</section>
				</div>
			</main>
		</Authenticated>
	);
}
