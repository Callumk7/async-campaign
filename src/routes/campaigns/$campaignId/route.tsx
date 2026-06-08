import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Authenticated } from "~/components/auth/autheticated";
import { CampaignNavigation } from "~/components/campaign/navigation";
import type { Id } from "../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/campaigns/$campaignId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { campaignId: campaignIdParam } = Route.useParams();
	const campaignId = campaignIdParam as Id<"campaigns">;

	return (
		<Authenticated>
			<div>
				<CampaignNavigation campaignId={campaignId} />
				<Outlet />
			</div>
		</Authenticated>
	);
}
