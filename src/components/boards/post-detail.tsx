import type * as React from "react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { ErrorText } from "./post-form";
import type { BoardPostWithReplies } from "./types";

export type PostDetailProps = {
	canReply: boolean;
	error: unknown;
	isError: boolean;
	isPending: boolean;
	onReplyBodyChange: (body: string) => void;
	onSubmitReply: (event: React.FormEvent<HTMLFormElement>) => void;
	post: BoardPostWithReplies;
	replyBody: string;
	selectedUserIdPresent: boolean;
};

export function PostDetail({
	canReply,
	error,
	isError,
	isPending,
	onReplyBodyChange,
	onSubmitReply,
	post,
	replyBody,
	selectedUserIdPresent,
}: PostDetailProps) {
	return (
		<article className="rounded-lg border p-4">
			<header className="space-y-1">
				<h4 className="font-semibold text-xl">{post.post.title}</h4>
				<p className="text-muted-foreground text-xs">
					Posted by {post.author?.name ?? "Unknown user"} ·{" "}
					{formatTimestamp(post.post._creationTime)}
				</p>
			</header>
			<p className="mt-4 whitespace-pre-wrap text-sm wrap-break-word">
				{post.post.body}
			</p>

			<Separator className="my-4" />

			<section className="space-y-3">
				<h5 className="font-medium">Replies</h5>
				{post.replies.length > 0 ? (
					post.replies.map(({ reply, author }) => (
						<div className="rounded-lg bg-muted/50 p-3" key={reply._id}>
							<p className="whitespace-pre-wrap text-sm wrap-break-word">
								{reply.body}
							</p>
							<p className="mt-2 text-muted-foreground text-xs">
								{author?.name ?? "Unknown user"} ·{" "}
								{formatTimestamp(reply._creationTime)}
							</p>
						</div>
					))
				) : (
					<p className="text-muted-foreground text-sm">
						No replies yet. Be the first to respond.
					</p>
				)}
			</section>

			<form className="mt-4 space-y-3" onSubmit={onSubmitReply}>
				<Textarea
					aria-label="Reply body"
					className="min-h-20"
					disabled={!selectedUserIdPresent || isPending}
					onChange={(event) => onReplyBodyChange(event.target.value)}
					placeholder={
						selectedUserIdPresent
							? "Write a reply…"
							: "Select a user before replying"
					}
					value={replyBody}
				/>
				<Button disabled={!canReply || isPending} type="submit">
					{isPending ? "Replying…" : "Post reply"}
				</Button>
				{isError ? <ErrorText error={error} /> : null}
			</form>
		</article>
	);
}

function formatTimestamp(timestamp: number) {
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(timestamp);
}
