import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/campaigns/$campaignId/journal")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/campaigns/$campaignId/journal"!</div>;
}
