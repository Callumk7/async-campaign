import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated } from "#/components/auth/autheticated";
import { Link } from "#/components/ui/link";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/campaign/")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			convexQuery(api.campaigns.getCampaigns),
		);
	},
});

function RouteComponent() {
	const { data } = useSuspenseQuery(convexQuery(api.campaigns.getCampaigns));
	return (
		<Authenticated>
			<div>
				<h1>Campaigns</h1>
				{data?.map((campaign) => (
					<Link
						to="/campaign/$campaignId"
						params={{ campaignId: campaign._id }}
						key={campaign._id}
					>
						{campaign.name}
					</Link>
				))}
			</div>
		</Authenticated>
	);
}
