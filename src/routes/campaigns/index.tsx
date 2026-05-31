import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/components/auth/auth-provider";
import { Authenticated } from "~/components/auth/autheticated";
import { Alert, AlertDescription } from "~/components/ui/alert";
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
	const queryClient = useQueryClient();
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
					<div>
						<h1 className="text-3xl font-bold text-slate-950">Campaigns</h1>
						<p>Create campaigns and open one to test child CRUD functions.</p>
					</div>
					{canCreateCampaign ? (
						<Link to="/campaigns/new">Create new campaign</Link>
					) : (
						<Alert variant="destructive">
							<AlertDescription>
								Only admins and DMs can create campaigns.
							</AlertDescription>
						</Alert>
					)}
				</div>

				{data.length === 0 ? (
					<Empty className="border border-dashed border-slate-300 text-slate-500">
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
									<p className="line-clamp-3 text-sm text-slate-600">
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
													if (!window.confirm(`Delete ${campaign.name}?`))
														return;
													await deleteCampaign.mutateAsync({
														id: campaign._id,
													});
													await queryClient.invalidateQueries({
														queryKey: campaignsQuery.queryKey,
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
