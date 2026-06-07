import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useAuth } from "~/components/auth/auth-provider";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface ChatInterfaceProps {
	roomId: Id<"rooms">;
	className?: string;
}

export function ChatInterface({ roomId, className }: ChatInterfaceProps) {
	const queryClient = useQueryClient();
	const { selectedUserId, selectedCharacterId, selectedUser } = useAuth();
	const [messageBody, setMessageBody] = React.useState("");
	const messagesQuery = convexQuery(api.messages.getMessagesByRoom, { roomId });
	const { data: messages, isLoading } = useQuery(messagesQuery);
	const createMessage = useMutation({
		mutationFn: useConvexMutation(api.messages.createMessage),
		onSuccess: async () => {
			setMessageBody("");
			await queryClient.invalidateQueries({ queryKey: messagesQuery.queryKey });
		},
	});

	const trimmedMessage = messageBody.trim();
	const canSend = selectedUserId !== null && trimmedMessage.length > 0;

	async function handleSubmit(event: React.ChangeEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!canSend || createMessage.isPending) return;

		await createMessage.mutateAsync({
			body: trimmedMessage,
			roomId,
			userId: selectedUserId,
			characterId: selectedCharacterId ?? undefined,
		});
	}

	return (
		<section
			className={cn(
				"flex h-full min-h-96 flex-col rounded-xl border bg-card text-card-foreground",
				className,
			)}
		>
			<header className="border-b px-4 py-3">
				<h2 className="font-semibold text-sm">Room chat</h2>
				<p className="text-muted-foreground text-xs">
					{selectedUser
						? `Posting as ${selectedUser.name}`
						: "Select a user to send messages."}
				</p>
			</header>

			<div className="flex-1 space-y-3 overflow-y-auto p-4">
				{isLoading ? (
					<p className="text-muted-foreground text-sm">Loading messages…</p>
				) : messages && messages.length > 0 ? (
					messages.map((message) => {
						const isOwnMessage = message.userId === selectedUserId;

						return (
							<div
								key={message._id}
								className={cn(
									"flex",
									isOwnMessage ? "justify-end" : "justify-start",
								)}
							>
								<div
									className={cn(
										"max-w-[80%] rounded-2xl px-3 py-2 text-sm",
										isOwnMessage
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground",
									)}
								>
									<p className="whitespace-pre-wrap wrap-break-word">
										{message.body}
									</p>
									<div className="mt-1 flex items-center gap-2 text-[0.7rem] opacity-70">
										<span>{isOwnMessage ? "You" : "Player"}</span>
										{message.isDMMessage ? <span>DM</span> : null}
									</div>
								</div>
							</div>
						);
					})
				) : (
					<div className="flex h-full items-center justify-center rounded-lg border border-dashed p-8 text-center">
						<p className="text-muted-foreground text-sm">
							No messages yet. Start the conversation below.
						</p>
					</div>
				)}
			</div>

			<form className="flex gap-2 border-t p-4" onSubmit={handleSubmit}>
				<Textarea
					aria-label="Message"
					className="max-h-32 min-h-10 flex-1 resize-none"
					disabled={!selectedUserId || createMessage.isPending}
					onChange={(event) => setMessageBody(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter" && !event.shiftKey) {
							event.preventDefault();
							event.currentTarget.form?.requestSubmit();
						}
					}}
					placeholder={
						selectedUserId
							? "Write a message…"
							: "Select a user before chatting"
					}
					value={messageBody}
				/>
				<Button disabled={!canSend || createMessage.isPending} type="submit">
					{createMessage.isPending ? "Sending…" : "Send"}
				</Button>
			</form>
			{createMessage.isError ? (
				<p className="px-4 pb-4 text-destructive text-sm">
					{createMessage.error instanceof Error
						? createMessage.error.message
						: "Failed to send message."}
				</p>
			) : null}
		</section>
	);
}
