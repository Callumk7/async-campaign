import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/components/auth/auth-provider";
import { Authenticated } from "~/components/auth/autheticated";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Empty, EmptyDescription } from "~/components/ui/empty";
import { Link } from "~/components/ui/link";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/campaigns/")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			convexQuery(api.campaigns.getCampaigns, {}),
		);
	},
});

function RouteComponent() {
	const { selectedUser } = useAuth();
	const campaignsQuery = convexQuery(api.campaigns.getCampaigns, {});
	const { data } = useSuspenseQuery(campaignsQuery);
	const deleteCampaign = useMutation({
		mutationFn: useConvexMutation(api.campaigns.deleteCampaign),
	});
	const canCreateCampaign =
		selectedUser?.role === "admin" || selectedUser?.role === "dm";

	return (
		<Authenticated>
			<main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					{canCreateCampaign ? (
						<Link variant="default" to="/campaigns/new">
							Create new campaign
						</Link>
					) : null}
				</div>

				{data.length === 0 ? (
					<Empty className="border border-dashed">
						<EmptyDescription>
							No campaigns yet. Create one to unlock the campaign workbench.
						</EmptyDescription>
					</Empty>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{data.map((campaign) => (
							<Card key={campaign._id} className="h-full">
								<CardHeader>
									<CardTitle>{campaign.name}</CardTitle>
								</CardHeader>
								<CardContent className="flex flex-1 flex-col gap-3">
									<p className="line-clamp-3 text-sm">
										{campaign.description || "No description."}
									</p>
									<div className="mt-auto flex items-center justify-between gap-3">
										<Badge variant="secondary">
											{campaign.status ?? "active"}
										</Badge>
										<div className="flex gap-3">
											<Link
												to="/campaigns/$campaignId"
												params={{ campaignId: campaign._id }}
											>
												Open
											</Link>
											<Button
												type="button"
												variant="destructive"
												onClick={async () => {
													await deleteCampaign.mutateAsync({
														id: campaign._id,
													});
												}}
											>
												Delete
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</main>
		</Authenticated>
	);
}
