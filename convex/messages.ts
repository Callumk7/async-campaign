import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMessage = query({
	args: {
		id: v.id("messages"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const createMessage = mutation({
	args: {
		body: v.string(),
		userId: v.id("users"),
		campaignId: v.id("campaigns"),
		characterId: v.id("characters"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("messages", {
			body: args.body,
			userId: args.userId,
			campaignId: args.campaignId,
			characterId: args.characterId,
		});
	},
});
