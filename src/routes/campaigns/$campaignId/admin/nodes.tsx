import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/campaigns/$campaignId/admin/nodes")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/campaigns/$campaignId/admin/nodes"!</div>;
}
