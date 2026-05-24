import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: useConvexMutation(api.users.createUser),
	});
	const { data, isLoading } = useQuery(convexQuery(api.users.getUsers));
	const [name, setName] = React.useState("");
	return (
		<div>
			{isLoading && <p>Loading...</p>}
			<table>
				<thead>
					<tr>
						<th>Name</th>
					</tr>
				</thead>
				<tbody>
					{data?.map((user) => (
						<tr key={user._id}>
							<td>{user.name}</td>
						</tr>
					))}
				</tbody>
			</table>
			<h1>Login</h1>
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					await mutateAsync({ name });
				}}
			>
				<label>
					Name:
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</label>
			</form>
			{isPending && <p>Creating user...</p>}
		</div>
	);
}
