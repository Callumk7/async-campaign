import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "#/components/auth/auth-provider";

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
			</nav>
			<Outlet />
		</div>
	);
}
