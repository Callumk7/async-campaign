import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/components/auth/auth-provider";

export const Route = createFileRoute("/campaigns/$campaignId/character")({
	component: RouteComponent,
});

function RouteComponent() {
	const { selectedCharacter } = useAuth();
	return <div>Selected character: {selectedCharacter?.name}</div>;
}
