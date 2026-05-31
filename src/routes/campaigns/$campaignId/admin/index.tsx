import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/components/auth/auth-provider";

export const Route = createFileRoute("/campaigns/$campaignId/admin/")({
	component: RouteComponent,
});

// TODO: The user must be an admin to access this route, for this specific campaign
function RouteComponent() {
	const { selectedUser } = useAuth();
	if (selectedUser?.role === "player") {
		return <div>You must be an admin to access this route.</div>;
	}
	return <div>Hello "/campaigns/$campaignId/admin/"!</div>;
}
