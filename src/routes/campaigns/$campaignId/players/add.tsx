import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Select } from "~/components/ui/select";
import { api } from "../../../../../convex/_generated/api";

export const Route = createFileRoute("/campaigns/$campaignId/players/add")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(convexQuery(api.users.getUsers));
	},
});

function RouteComponent() {
	const { data: allUsers } = useSuspenseQuery(convexQuery(api.users.getUsers));
	return (
		<div>
			<h2>Add players to this campaign</h2>
			<Select>
				{allUsers.map((user) => (
					<option key={user._id}>{user.name}</option>
				))}
			</Select>
		</div>
	);
}
