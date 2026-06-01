import { createFileRoute, Navigate } from "@tanstack/react-router";
import type { Id } from "../../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/campaigns/$campaignId/players/add")({
	component: RouteComponent,
});

function RouteComponent() {
	const { campaignId } = Route.useParams();
	return (
		<Navigate
			to="/campaigns/$campaignId/admin"
			params={{ campaignId: campaignId as Id<"campaigns"> }}
		/>
	);
}
