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
		return await createCampaignBoard(ctx, {
			campaignId: args.campaignId,
			name: args.name,
			description: args.description,
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
