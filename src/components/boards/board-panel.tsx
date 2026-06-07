import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useAuth } from "~/components/auth/auth-provider";
import { Separator } from "~/components/ui/separator";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { PostDetail } from "./post-detail";
import { PostForm } from "./post-form";
import { PostList } from "./post-list";
import type { BoardPostWithReplies } from "./types";

export type BoardPanelProps = {
	board: Doc<"boards">;
};

export function BoardPanel({ board }: BoardPanelProps) {
	const queryClient = useQueryClient();
	const { selectedUserId, selectedUser } = useAuth();
	const [title, setTitle] = React.useState("");
	const [body, setBody] = React.useState("");
	const [replyBody, setReplyBody] = React.useState("");
	const [selectedPostId, setSelectedPostId] =
		React.useState<Id<"boardPosts"> | null>(null);
	const postsQuery = convexQuery(api.boards.getBoardPosts, {
		boardId: board._id,
	});
	const { data: posts, isLoading } = useQuery(postsQuery);
	const createPost = useMutation({
		mutationFn: useConvexMutation(api.boards.createPost),
		onSuccess: async () => {
			setTitle("");
			setBody("");
			await queryClient.invalidateQueries({ queryKey: postsQuery.queryKey });
		},
	});
	const createReply = useMutation({
		mutationFn: useConvexMutation(api.boards.createReply),
		onSuccess: async () => {
			setReplyBody("");
			await queryClient.invalidateQueries({ queryKey: postsQuery.queryKey });
		},
	});

	const typedPosts = posts as BoardPostWithReplies[] | undefined;
	const selectedPost = getSelectedPost(typedPosts, selectedPostId);
	const trimmedTitle = title.trim();
	const trimmedBody = body.trim();
	const trimmedReplyBody = replyBody.trim();
	const canCreatePost =
		selectedUserId !== null &&
		trimmedTitle.length > 0 &&
		trimmedBody.length > 0;
	const canCreateReply =
		selectedUserId !== null &&
		selectedPost !== null &&
		trimmedReplyBody.length > 0;

	async function handleCreatePost(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!selectedUserId || !canCreatePost || createPost.isPending) return;

		const postId = await createPost.mutateAsync({
			boardId: board._id,
			title: trimmedTitle,
			body: trimmedBody,
			authorId: selectedUserId,
		});
		setSelectedPostId(postId as Id<"boardPosts">);
	}

	async function handleCreateReply(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (
			!selectedUserId ||
			!selectedPost ||
			!canCreateReply ||
			createReply.isPending
		) {
			return;
		}

		await createReply.mutateAsync({
			postId: selectedPost.post._id,
			body: trimmedReplyBody,
			authorId: selectedUserId,
		});
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-semibold text-lg">{board.name}</h3>
				{board.description ? (
					<p className="text-muted-foreground text-sm">{board.description}</p>
				) : null}
			</div>

			<PostForm
				body={body}
				canSubmit={canCreatePost}
				error={createPost.error}
				isError={createPost.isError}
				isPending={createPost.isPending}
				onBodyChange={setBody}
				onSubmit={handleCreatePost}
				onTitleChange={setTitle}
				selectedUserIdPresent={selectedUserId !== null}
				selectedUserName={selectedUser?.name}
				title={title}
			/>

			<Separator />

			{isLoading ? (
				<p className="text-muted-foreground text-sm">Loading posts…</p>
			) : typedPosts && typedPosts.length > 0 && selectedPost ? (
				<div className="grid gap-4 lg:grid-cols-[minmax(14rem,18rem)_1fr]">
					<PostList
						onSelectPost={setSelectedPostId}
						posts={typedPosts}
						selectedPostId={selectedPost.post._id}
					/>
					<PostDetail
						canReply={canCreateReply}
						error={createReply.error}
						isError={createReply.isError}
						isPending={createReply.isPending}
						onReplyBodyChange={setReplyBody}
						onSubmitReply={handleCreateReply}
						post={selectedPost}
						replyBody={replyBody}
						selectedUserIdPresent={selectedUserId !== null}
					/>
				</div>
			) : (
				<div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
					No posts yet. Create the first discussion for this board.
				</div>
			)}
		</div>
	);
}

function getSelectedPost(
	posts: BoardPostWithReplies[] | undefined,
	selectedPostId: Id<"boardPosts"> | null,
) {
	return (
		posts?.find(({ post }) => post._id === selectedPostId) ?? posts?.[0] ?? null
	);
}
