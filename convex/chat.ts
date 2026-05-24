import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const sendMessage = mutation({
	args: {
		user: v.id("users"),
		body: v.string()
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("messages", {
			user: args.user,
			body: args.body
		})
	}
})
