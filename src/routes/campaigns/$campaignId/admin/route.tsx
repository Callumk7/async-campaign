import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/campaigns/$campaignId/admin")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
