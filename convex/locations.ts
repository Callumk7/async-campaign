import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getLocation = query({
	args: {
		id: v.id("locations"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const createLocation = mutation({
	args: {
		name: v.string(),
		description: v.string(),
		campaignId: v.id("campaigns"),
		parentLocationId: v.optional(v.id("locations")),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("locations", {
			name: args.name,
			description: args.description,
			campaignId: args.campaignId,
			parentLocationId: args.parentLocationId,
		});
	},
});
