import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "~/components/auth/auth-provider";
import { Authenticated } from "~/components/auth/autheticated";

export const Route = createFileRoute("/admin")({
	component: RouteComponent,
});

function RouteComponent() {
	const { selectedUser } = useAuth();
	if (!selectedUser || selectedUser.role !== "admin") {
		return <div>You must be an admin to access this page.</div>;
	}

	return (
		<Authenticated>
			<Outlet />
		</Authenticated>
	);
}
