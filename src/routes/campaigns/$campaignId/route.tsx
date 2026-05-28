import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/campaigns/$campaignId")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			convexQuery(api.campaigns.getCampaign, {
				id: params.campaignId as Id<"campaigns">,
			}),
		);
	},
});

function RouteComponent() {
	const params = Route.useParams();
	const { data } = useSuspenseQuery(
		convexQuery(api.campaigns.getCampaign, {
			id: params.campaignId as Id<"campaigns">,
		}),
	);
	return (
		<div>
			<h1>{data?.name}</h1>
		</div>
	);
}
