import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCampaigns = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("campaigns").take(50);
	},
});

export const getCampaign = query({
	args: {
		id: v.id("campaigns"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const createCampaign = mutation({
	args: {
		name: v.string(),
		description: v.string(),
		members: v.optional(v.array(v.id("users"))),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("campaigns", {
			name: args.name,
			description: args.description,
			members: args.members ?? [],
		});
	},
});
