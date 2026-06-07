import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/components/auth/auth-provider";
import { Link } from "~/components/ui/link";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/admin/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { selectedUserId } = useAuth();
	const { data: campaigns } = useQuery(
		convexQuery(api.campaigns.getCampaignsByOwner, {
			ownerId: selectedUserId as Id<"users">,
		}),
	);
	return (
		<div>
			<h1>Admin</h1>
			<ul>
				{campaigns?.map((campaign) => (
					<li key={campaign._id}>
						<Link
							to="/admin/$campaignId/quests"
							params={{ campaignId: campaign._id }}
						>
							{campaign.name}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
