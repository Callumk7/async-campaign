import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/campaign/$campaignId/layout")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="bg-cyan-300">
			<Outlet />
		</div>
	);
}
