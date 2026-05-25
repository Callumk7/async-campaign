import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/campaign/layout")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<h1>Campaign</h1>
			<Outlet />
		</div>
	);
}
