import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/campaigns/$campaignId/chat")({
	component: RouteComponent,
});

function RouteComponent() {
	// TODO: Implement chat
	return <div>Hello "/campaigns/$campaignId/chat"!</div>;
}
