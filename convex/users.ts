import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUsers = query({
	handler: async (ctx) => {
		return await ctx.db.query("users").collect()
	}
})

export const createUser = mutation({
	args: {
		name: v.string()
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("users", {
			name: args.name,
			role: "player"
		})
	}
})
