import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/campaigns/$campaignId/quests/")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			convexQuery(api.quests.getCampaignQuests, {
				campaignId: params.campaignId as Id<"campaigns">,
			}),
		);
	},
});

function RouteComponent() {
	const campaignId = Route.useParams().campaignId as Id<"campaigns">;
	const { data } = useSuspenseQuery(
		convexQuery(api.quests.getCampaignQuests, { campaignId }),
	);
	return (
		<div className="flex flex-col gap-4 p-4">
			<h1 className="text-4xl">Quests</h1>
			<div className="grid grid-cols-4 gap-4">
				{data.map((quest) => (
					<Card key={quest._id}>
						<CardHeader>
							<CardTitle>{quest.name}</CardTitle>
							<CardContent>{quest.description}</CardContent>
						</CardHeader>
					</Card>
				))}
			</div>
		</div>
	);
}
