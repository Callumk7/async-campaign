import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/campaigns/$campaignId/players")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
