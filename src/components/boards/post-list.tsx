import { cn } from "~/lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";
import type { BoardPostWithReplies } from "./types";

export type PostListProps = {
	onSelectPost: (postId: Id<"boardPosts">) => void;
	posts: BoardPostWithReplies[];
	selectedPostId: Id<"boardPosts">;
};

export function PostList({
	onSelectPost,
	posts,
	selectedPostId,
}: PostListProps) {
	return (
		<div className="space-y-2">
			{posts.map(({ post, author, replies }) => {
				const isSelected = post._id === selectedPostId;

				return (
					<button
						className={cn(
							"w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/60",
							isSelected && "border-primary bg-muted",
						)}
						key={post._id}
						onClick={() => onSelectPost(post._id)}
						type="button"
					>
						<p className="font-medium text-sm">{post.title}</p>
						<p className="mt-1 text-muted-foreground text-xs">
							{author?.name ?? "Unknown user"} · {replies.length} replies
						</p>
					</button>
				);
			})}
		</div>
	);
}
