import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "~/components/auth/auth-provider";
import { Authenticated } from "~/components/auth/autheticated";
import { Link } from "~/components/ui/link";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/campaigns/$campaignId/admin")({
	component: RouteComponent,
});

function RouteComponent() {
	// TODO: Can we extract this out as we will probably want to use this all over the place
	const campaignId = Route.useParams().campaignId as Id<"campaigns">;
	const campaignQuery = convexQuery(api.campaigns.getCampaignWithChildren, {
		id: campaignId,
	});
	const { data } = useSuspenseQuery(campaignQuery);
	const { selectedUser, selectedUserId } = useAuth();
	const currentMembership = data?.membersWithUsers.find(
		(row) => row.membership.userId === selectedUserId,
	);
	const canManage =
		selectedUser?.role === "admin" ||
		data?.campaign.ownerId === selectedUserId ||
		currentMembership?.membership.role === "admin" ||
		currentMembership?.membership.role === "dm";

	if (!canManage) {
		return (
			<Authenticated>
				<main className="mx-auto max-w-3xl p-8">
					<Link to="/campaigns/$campaignId" params={{ campaignId }}>
						← Back to campaign
					</Link>
					<div className="mt-6 rounded-xl border p-5">
						You must be a campaign admin or DM to manage this campaign.
					</div>
				</main>
			</Authenticated>
		);
	}
	return (
		<Authenticated>
			<Outlet />
		</Authenticated>
	);
}
