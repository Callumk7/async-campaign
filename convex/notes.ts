import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getNote = query({
	args: {
		id: v.id("notes"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const createNote = mutation({
	args: {
		title: v.string(),
		content: v.string(),
		authorId: v.id("users"),
		campaignId: v.id("campaigns"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("notes", {
			title: args.title,
			content: args.content,
			authorId: args.authorId,
			campaignId: args.campaignId,
		});
	},
});
