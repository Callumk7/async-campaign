import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Authenticated } from "~/components/auth/autheticated";
import { Button } from "~/components/ui/button";
import { Field, Form, Label } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Link } from "~/components/ui/link";
import { Select } from "~/components/ui/select";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/users/")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			convexQuery(api.users.getUsers, {}),
		);
	},
});

function RouteComponent() {
	const queryClient = useQueryClient();
	const usersQuery = convexQuery(api.users.getUsers, {});
	const { data: users } = useSuspenseQuery(usersQuery);
	const createUser = useMutation({
		mutationFn: useConvexMutation(api.users.createUser),
	});
	const updateUser = useMutation({
		mutationFn: useConvexMutation(api.users.updateUser),
	});
	const deleteUser = useMutation({
		mutationFn: useConvexMutation(api.users.deleteUser),
	});
	const [name, setName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [role, setRole] = React.useState<"admin" | "dm" | "player">("player");

	async function refresh() {
		await queryClient.invalidateQueries({ queryKey: usersQuery.queryKey });
	}

	return (
		<Authenticated>
			<main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
				<div>
					<p className="text-sm uppercase tracking-wide text-slate-500">
						CRUD route
					</p>
					<h1 className="text-3xl font-bold text-slate-950">Users</h1>
					<p className="text-slate-600">
						Create, rename, change roles, and delete user records.
					</p>
				</div>

				<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
					<h2 className="mb-4 text-xl font-semibold">Create user</h2>
					<Form
						onSubmit={async (event) => {
							event.preventDefault();
							if (!name.trim()) return;
							await createUser.mutateAsync({
								name: name.trim(),
								email: email.trim() || undefined,
								role,
							});
							setName("");
							setEmail("");
							setRole("player");
							await refresh();
						}}
					>
						<div className="grid gap-4 md:grid-cols-3">
							<Field>
								<Label htmlFor="user-name">Name</Label>
								<Input
									id="user-name"
									value={name}
									onChange={(event) => setName(event.target.value)}
									required
								/>
							</Field>
							<Field>
								<Label htmlFor="user-email">Email</Label>
								<Input
									id="user-email"
									type="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
								/>
							</Field>
							<Field>
								<Label htmlFor="user-role">Role</Label>
								<Select
									id="user-role"
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
						</div>
						<Button type="submit" disabled={createUser.isPending}>
							{createUser.isPending ? "Creating..." : "Create user"}
						</Button>
					</Form>
				</section>

				<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
					<h2 className="mb-4 text-xl font-semibold">Existing users</h2>
					{users.length === 0 ? (
						<p className="text-slate-500">No users yet.</p>
					) : null}
					<ul className="flex flex-col gap-3">
						{users.map((user) => (
							<li
								key={user._id}
								className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 p-3"
							>
								<div>
									<p className="font-medium text-slate-950">{user.name}</p>
									<p className="text-sm text-slate-500">
										{user.email || "No email"} · {user.role}
									</p>
								</div>
								<div className="flex gap-2">
									<Link
										to="/users/$userId/characters"
										params={{ userId: user._id }}
									>
										Characters
									</Link>
									<button
										type="button"
										className="text-sm text-blue-600 hover:underline"
										onClick={async () => {
											const nextName = window.prompt("User name", user.name);
											if (!nextName?.trim()) return;
											await updateUser.mutateAsync({
												id: user._id,
												name: nextName.trim(),
											});
											await refresh();
										}}
									>
										Rename
									</button>
									<button
										type="button"
										className="text-sm text-blue-600 hover:underline"
										onClick={async () => {
											const nextRole = window.prompt(
												"Role: player, dm, or admin",
												user.role,
											);
											if (
												nextRole !== "player" &&
												nextRole !== "dm" &&
												nextRole !== "admin"
											)
												return;
											await updateUser.mutateAsync({
												id: user._id,
												role: nextRole,
											});
											await refresh();
										}}
									>
										Role
									</button>
									<button
										type="button"
										className="text-sm text-red-600 hover:underline"
										onClick={async () => {
											if (!window.confirm(`Delete ${user.name}?`)) return;
											await deleteUser.mutateAsync({
												id: user._id as Id<"users">,
											});
											await refresh();
										}}
									>
										Delete
									</button>
								</div>
							</li>
						))}
					</ul>
				</section>
			</main>
		</Authenticated>
	);
}
