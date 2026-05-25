import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getDecisionNodes = query({
	args: {
		campaignId: v.id("campaigns"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.query("decisionNodes").withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId)).collect()
	},
})

export const getDecisionNode = query({
	args: {
		id: v.id("decisionNodes"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const createDecisionNode = mutation({
	args: {
		name: v.string(),
		content: v.string(),
		campaignId: v.id("campaigns"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("decisionNodes", {
			name: args.name,
			content: args.content,
			campaignId: args.campaignId,
		});
	},
});
