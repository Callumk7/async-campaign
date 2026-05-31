import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated } from "~/components/auth/autheticated";
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
	const campaignsQuery = convexQuery(api.campaigns.getCampaigns, {});
	const { data } = useSuspenseQuery(campaignsQuery);
	const deleteCampaign = useMutation({
		mutationFn: useConvexMutation(api.campaigns.deleteCampaign),
	});

	return (
		<Authenticated>
			<main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-sm uppercase tracking-wide text-slate-500">
							CRUD route
						</p>
						<h1 className="text-3xl font-bold text-slate-950">Campaigns</h1>
						<p className="text-slate-600">
							Create campaigns and open one to test child CRUD functions.
						</p>
					</div>
					<Link
						to="/campaigns/new"
						className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 hover:no-underline"
					>
						Create new campaign
					</Link>
				</div>

				{data.length === 0 ? (
					<section className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
						No campaigns yet. Create one to unlock the campaign workbench.
					</section>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{data.map((campaign) => (
							<article
								key={campaign._id}
								className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
							>
								<div>
									<h2 className="text-xl font-semibold text-slate-950">
										{campaign.name}
									</h2>
									<p className="line-clamp-3 text-sm text-slate-600">
										{campaign.description || "No description."}
									</p>
								</div>
								<div className="mt-auto flex items-center justify-between gap-3">
									<span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
										{campaign.status ?? "active"}
									</span>
									<div className="flex gap-3">
										<Link
											to="/campaigns/$campaignId"
											params={{ campaignId: campaign._id }}
										>
											Open
										</Link>
										<button
											type="button"
											className="text-sm text-red-600 hover:underline"
											onClick={async () => {
												if (!window.confirm(`Delete ${campaign.name}?`)) return;
												await deleteCampaign.mutateAsync({ id: campaign._id });
												await queryClient.invalidateQueries({
													queryKey: campaignsQuery.queryKey,
												});
											}}
										>
											Delete
										</button>
									</div>
								</div>
							</article>
						))}
					</div>
				)}
			</main>
		</Authenticated>
	);
}
