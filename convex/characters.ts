import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCharacters = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("characters").take(50);
	},
});

export const getCharacter = query({
	args: {
		id: v.id("characters"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const createCharacter = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		playerId: v.optional(v.id("users")),
		locationId: v.optional(v.id("locations")),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("characters", {
			name: args.name,
			description: args.description,
			playerId: args.playerId,
			locationId: args.locationId,
		});
	},
});
