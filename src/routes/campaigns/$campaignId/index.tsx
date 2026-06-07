import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated } from "~/components/auth/autheticated";
import { ChatInterface } from "~/components/chat/chat-interface";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Link } from "~/components/ui/link";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

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
					<Card>
						<CardHeader>
							<CardTitle>Message Board</CardTitle>
							<CardDescription>Discuss the campaign here.</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs>
								<TabsList>
									{data.boards.map((board) => (
										<TabsTrigger key={board._id} value={board._id}>
											{board.name}
										</TabsTrigger>
									))}
								</TabsList>
								{data.boards.map((board) => (
									<TabsContent key={board._id} value={board._id}>
										<div>Board content</div>
									</TabsContent>
								))}
							</Tabs>
						</CardContent>
					</Card>
				</div>
			</div>
		</main>
	);
}
