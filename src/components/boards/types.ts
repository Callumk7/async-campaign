import type { Doc } from "../../../convex/_generated/dataModel";

export type BoardPostReplyWithAuthor = {
	reply: Doc<"boardPostReplies">;
	author: Doc<"users"> | null;
};

export type BoardPostWithReplies = {
	post: Doc<"boardPosts">;
	author: Doc<"users"> | null;
	replies: BoardPostReplyWithAuthor[];
};
