import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated } from "~/components/auth/autheticated";
import { CampaignMessageBoard } from "~/components/boards/campaign-message-board";
import { ChatInterface } from "~/components/chat/chat-interface";
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

	return (
		<main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
			<div className="grid grid-cols-4 gap-4">
				<div className="col-span-1">
					<ChatInterface roomId={data.campaign.roomId} />
				</div>
				<div className="col-span-3">
					<CampaignMessageBoard boards={data.boards} />
				</div>
			</div>
		</main>
	);
}
