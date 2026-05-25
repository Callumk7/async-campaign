import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/chat")({
	component: ChatRoute,
});

function ChatRoute() {
	const usersQuery = useQuery(convexQuery(api.users.getUsers, {}));
	const messagesQuery = useQuery(convexQuery(api.chat.listMessages, {}));
	const createUser = useMutation({
		mutationFn: useConvexMutation(api.users.createUser),
	});
	const sendMessage = useMutation({
		mutationFn: useConvexMutation(api.chat.sendMessage),
	});

	const [name, setName] = React.useState("");
	const [selectedUserId, setSelectedUserId] = React.useState<Id<"users"> | "">(
		"",
	);
	const [messageBody, setMessageBody] = React.useState("");

	return (
		<main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
			<h1 className="text-3xl font-bold">Chat</h1>

			<section className="flex flex-col gap-3 rounded border p-4">
				<h2 className="text-xl font-semibold">Choose a user</h2>
				<select
					value={selectedUserId}
					onChange={(event) =>
						setSelectedUserId(event.target.value as Id<"users"> | "")
					}
				>
					<option value="">Select a user</option>
					{usersQuery.data?.map((user) => (
						<option key={user._id} value={user._id}>
							{user.name}
						</option>
					))}
				</select>

				<form
					className="flex gap-2"
					onSubmit={async (event) => {
						event.preventDefault();
						const trimmedName = name.trim();
						if (!trimmedName) return;
						const userId = await createUser.mutateAsync({ name: trimmedName });
						setSelectedUserId(userId);
						setName("");
					}}
				>
					<input
						aria-label="New user name"
						placeholder="New user name"
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
					<button type="submit" disabled={createUser.isPending}>
						Create user
					</button>
				</form>
			</section>

			<section className="flex flex-col gap-3 rounded border p-4">
				<h2 className="text-xl font-semibold">Messages</h2>
				{messagesQuery.isLoading && <p>Loading messages...</p>}
				<div className="flex flex-col gap-2">
					{messagesQuery.data?.map((message) => (
						<article key={message._id} className="rounded bg-gray-100 p-3">
							<p className="font-semibold">{message.userName}</p>
							<p>{message.body}</p>
						</article>
					))}
				</div>

				<form
					className="flex gap-2"
					onSubmit={async (event) => {
						event.preventDefault();
						const trimmedMessage = messageBody.trim();
						if (!selectedUserId || !trimmedMessage) return;
						await sendMessage.mutateAsync({
							user: selectedUserId,
							body: trimmedMessage,
						});
						setMessageBody("");
					}}
				>
					<input
						aria-label="Message"
						placeholder={
							selectedUserId ? "Type a message" : "Select a user first"
						}
						value={messageBody}
						onChange={(event) => setMessageBody(event.target.value)}
					/>
					<button
						type="submit"
						disabled={!selectedUserId || sendMessage.isPending}
					>
						Send
					</button>
				</form>
			</section>
		</main>
	);
}
