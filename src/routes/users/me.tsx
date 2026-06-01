import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/components/auth/auth-provider";
import { Authenticated } from "~/components/auth/autheticated";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/users/me")({
	component: RouteComponent,
});

function RouteComponent() {
	const { selectedUser } = useAuth();
	const { data: userCharacters } = useQuery(
		convexQuery(
			api.characters.getCharactersByPlayer,
			selectedUser?._id ? { playerId: selectedUser?._id } : "skip",
		),
	);
	return (
		<Authenticated>
			<div>Hello {selectedUser?.name}</div>
			<pre>{JSON.stringify(userCharacters, null, 2)}</pre>
		</Authenticated>
	);
}
