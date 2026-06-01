import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useAuth } from "~/components/auth/auth-provider";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { NativeSelect as Select } from "~/components/ui/native-select";
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
		<main className="mx-auto w-full max-w-2xl flex flex-col gap-6 p-8">
			<h1 className="text-3xl font-bold">Choose your user</h1>

			<Card>
				<CardHeader>
					<CardTitle>Existing users</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					{usersQuery.isLoading && <p>Loading users...</p>}
					{usersQuery.data?.length === 0 && <p>No users yet.</p>}
					<div className="flex flex-col gap-2">
						{usersQuery.data?.map((user) => (
							<Button
								key={user._id}
								type="button"
								variant="outline"
								onClick={() => {
									selectUser(user);
									void navigate({ to: "/" });
								}}
							>
								{user.name} ({user.role})
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Create a user</CardTitle>
				</CardHeader>
				<CardContent>
					<form
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
						<FieldGroup className="grid gap-2 sm:grid-cols-[1fr_10rem_auto]">
							<Field>
								<FieldLabel htmlFor="login-user-name" className="sr-only">
									User name
								</FieldLabel>
								<Input
									id="login-user-name"
									placeholder="User name"
									value={name}
									onChange={(event) => setName(event.target.value)}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="login-user-role" className="sr-only">
									Role
								</FieldLabel>
								<Select
									id="login-user-role"
									value={role}
									onChange={(event) =>
										setRole(event.target.value as typeof role)
									}
								>
									<option value="player">Player</option>
									<option value="dm">DM</option>
									<option value="admin">Admin</option>
								</Select>
							</Field>
							<Button type="submit" disabled={createUser.isPending}>
								Create user
							</Button>
						</FieldGroup>
					</form>
					{createUser.isPending && <p>Creating user...</p>}
				</CardContent>
			</Card>
		</main>
	);
}
