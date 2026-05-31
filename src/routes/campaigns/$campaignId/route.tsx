import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "#/components/auth/auth-provider";
import { Link } from "#/components/ui/link";

export const Route = createFileRoute("/campaigns/$campaignId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { selectedCharacter } = useAuth();
	return (
		<div>
			<nav>
				{selectedCharacter ? (
					<span>{selectedCharacter.name}</span>
				) : (
					<span>No character selected</span>
				)}
				<Link to="/campaigns/$campaignId/admin">Admin</Link>
			</nav>
			<Outlet />
		</div>
	);
}
