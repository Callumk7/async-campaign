import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const userRole = v.union(v.literal("admin"), v.literal("dm"), v.literal("player"));

export const getUsers = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("users").take(50);
	},
});

export const getUser = query({
	args: {
		id: v.id("users"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const createUser = mutation({
	args: {
		name: v.string(),
		role: v.optional(userRole),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("users", {
			name: args.name,
			role: args.role ?? "player",
		});
	},
});
