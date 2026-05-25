import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listMessages = query({
	args: {},
	handler: async (ctx) => {
		const messages = await ctx.db.query("messages").order("desc").take(50);
		const messagesWithUsers = await Promise.all(
			messages.map(async (message) => {
				const user = await ctx.db.get(message.userId);
				return {
					...message,
					userName: user?.name ?? "Unknown user",
				};
			}),
		);
		return messagesWithUsers.reverse();
	},
});

export const sendMessage = mutation({
	args: {
		user: v.id("users"),
		body: v.string(),
		campaignId: v.optional(v.id("campaigns")),
		characterId: v.optional(v.id("characters")),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.user);
		if (!user) {
			throw new Error("User not found");
		}
		if (!args.campaignId) {
			throw new Error("Campaign is required to send a message");
		}
		if (!args.characterId) {
			throw new Error("Character is required to send a message");
		}

		return await ctx.db.insert("messages", {
			userId: args.user,
			body: args.body,
			campaignId: args.campaignId,
			characterId: args.characterId,
		});
	},
});
