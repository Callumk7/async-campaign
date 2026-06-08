import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCampaignQuests = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("quests")
			.withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
			.take(50);
	},
});

export const createQuest = mutation({
	args: {
		campaignId: v.id("campaigns"),
		name: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const campaign = await ctx.db.get(args.campaignId);
		if (!campaign) throw new Error("Campaign not found.");

		const name = args.name.trim();
		if (!name) throw new Error("Quest name is required.");

		return await ctx.db.insert("quests", {
			campaignId: args.campaignId,
			name,
			description: args.description?.trim(),
		});
	},
});
