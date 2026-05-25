import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getFaction = query({
	args: {
		id: v.id("factions"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const createFaction = mutation({
	args: {
		name: v.string(),
		members: v.optional(v.array(v.id("characters"))),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("factions", {
			name: args.name,
			members: args.members ?? [],
		});
	},
});
