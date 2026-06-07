import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { createCampaignBoard } from "./lib/boards";

export const createBoard = mutation({
	args: {
		campaignId: v.id("campaigns"),
		name: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const campaign = await ctx.db.get(args.campaignId);
		if (!campaign) throw new Error("Campaign not found.");

		const name = args.name.trim();
		if (!name) throw new Error("Board name is required.");

		return await createCampaignBoard(ctx, {
			campaignId: args.campaignId,
			name,
			description: args.description?.trim(),
		});
	},
});

export const getCampaignBoards = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("boards")
			.withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
			.take(50);
	},
});

export const getBoardPosts = query({
	args: { boardId: v.id("boards") },
	handler: async (ctx, args) => {
		const posts = await ctx.db
			.query("boardPosts")
			.withIndex("by_boardId", (q) => q.eq("boardId", args.boardId))
			.order("desc")
			.take(50);

		return await Promise.all(
			posts.map(async (post) => {
				const replies = await ctx.db
					.query("boardPostReplies")
					.withIndex("by_postId", (q) => q.eq("postId", post._id))
					.order("asc")
					.take(100);

				const [author, repliesWithAuthors] = await Promise.all([
					ctx.db.get(post.authorId),
					Promise.all(
						replies.map(async (reply) => ({
							reply,
							author: await ctx.db.get(reply.authorId),
						})),
					),
				]);

				return {
					post,
					author,
					replies: repliesWithAuthors,
				};
			}),
		);
	},
});

export const createPost = mutation({
	args: {
		boardId: v.id("boards"),
		title: v.string(),
		body: v.string(),
		authorId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const [board, author] = await Promise.all([
			ctx.db.get(args.boardId),
			ctx.db.get(args.authorId),
		]);
		if (!board) throw new Error("Board not found.");
		if (!author) throw new Error("Author not found.");

		const title = args.title.trim();
		const body = args.body.trim();
		if (!title) throw new Error("Post title is required.");
		if (!body) throw new Error("Post body is required.");

		return await ctx.db.insert("boardPosts", {
			boardId: args.boardId,
			title,
			body,
			authorId: args.authorId,
			updatedAt: Date.now(),
		});
	},
});

export const createReply = mutation({
	args: {
		postId: v.id("boardPosts"),
		body: v.string(),
		authorId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const [post, author] = await Promise.all([
			ctx.db.get(args.postId),
			ctx.db.get(args.authorId),
		]);
		if (!post) throw new Error("Post not found.");
		if (!author) throw new Error("Author not found.");

		const body = args.body.trim();
		if (!body) throw new Error("Reply body is required.");

		return await ctx.db.insert("boardPostReplies", {
			postId: args.postId,
			body,
			authorId: args.authorId,
			updatedAt: Date.now(),
		});
	},
});
