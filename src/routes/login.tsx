import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useAuth } from "~/components/auth/auth-provider";
import { Select } from "~/components/ui/select";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { selectUser } = useAuth();
	const createUser = useMutation({
		mutationFn: useConvexMutation(api.users.createUser),
	});
	const usersQuery = useQuery(convexQuery(api.users.getUsers, {}));
	const [name, setName] = React.useState("");
	const [role, setRole] = React.useState<"admin" | "dm" | "player">("player");

	return (
		<main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
			<h1 className="text-3xl font-bold">Choose your user</h1>

			<section className="flex flex-col gap-3 rounded border p-4">
				<h2 className="text-xl font-semibold">Existing users</h2>
				{usersQuery.isLoading && <p>Loading users...</p>}
				{usersQuery.data?.length === 0 && <p>No users yet.</p>}
				<div className="flex flex-col gap-2">
					{usersQuery.data?.map((user) => (
						<button
							key={user._id}
							type="button"
							onClick={() => {
								selectUser(user);
								void navigate({ to: "/" });
							}}
						>
							{user.name} ({user.role})
						</button>
					))}
				</div>
			</section>

			<section className="flex flex-col gap-3 rounded border p-4">
				<h2 className="text-xl font-semibold">Create a user</h2>
				<form
					className="grid gap-2 sm:grid-cols-[1fr_10rem_auto]"
					onSubmit={async (event) => {
						event.preventDefault();
						const trimmedName = name.trim();
						if (!trimmedName) return;

						const userId = await createUser.mutateAsync({
							name: trimmedName,
							role,
						});
						selectUser({
							_id: userId,
							_creationTime: Date.now(),
							name: trimmedName,
							role,
							updatedAt: Date.now(),
						});
						setName("");
						setRole("player");
						void navigate({ to: "/" });
					}}
				>
					<input
						aria-label="User name"
						placeholder="User name"
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
					<Select
						aria-label="Role"
						value={role}
						onChange={(event) => setRole(event.target.value as typeof role)}
					>
						<option value="player">Player</option>
						<option value="dm">DM</option>
						<option value="admin">Admin</option>
					</Select>
					<button type="submit" disabled={createUser.isPending}>
						Create user
					</button>
				</form>
				{createUser.isPending && <p>Creating user...</p>}
			</section>
		</main>
	);
}
