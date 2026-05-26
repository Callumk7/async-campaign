import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Authenticated } from "#/components/auth/autheticated";

export const Route = createFileRoute("/admin")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Authenticated>
			<Outlet />
		</Authenticated>
	);
}
