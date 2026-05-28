import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const visibility = v.union(v.literal("public"), v.literal("private"), v.literal("dm"));

export const getMessages = query({
	args: {},
	handler: async (ctx) => {
		return (await ctx.db.query("messages").order("desc").take(50)).reverse();
	},
});

export const getMessagesByCampaign = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		return (
			await ctx.db
				.query("messages")
				.withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
				.order("desc")
				.take(50)
		).reverse();
	},
});

export const getMessagesByUser = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return (
			await ctx.db
				.query("messages")
				.withIndex("by_userId", (q) => q.eq("userId", args.userId))
				.order("desc")
				.take(50)
		).reverse();
	},
});

export const getMessagesByCharacter = query({
	args: { characterId: v.id("characters") },
	handler: async (ctx, args) => {
		return (
			await ctx.db
				.query("messages")
				.withIndex("by_characterId", (q) => q.eq("characterId", args.characterId))
				.order("desc")
				.take(50)
		).reverse();
	},
});

export const getMessagesByCampaignAndCharacter = query({
	args: { campaignId: v.id("campaigns"), characterId: v.optional(v.id("characters")) },
	handler: async (ctx, args) => {
		return (
			await ctx.db
				.query("messages")
				.withIndex("by_campaignId_and_characterId", (q) =>
					q.eq("campaignId", args.campaignId).eq("characterId", args.characterId),
				)
				.order("desc")
				.take(50)
		).reverse();
	},
});

export const getMessagesByCampaignAndParent = query({
	args: { campaignId: v.id("campaigns"), parentMessageId: v.optional(v.id("messages")) },
	handler: async (ctx, args) => {
		return (
			await ctx.db
				.query("messages")
				.withIndex("by_campaignId_and_parentMessageId", (q) =>
					q.eq("campaignId", args.campaignId).eq("parentMessageId", args.parentMessageId),
				)
				.order("desc")
				.take(50)
		).reverse();
	},
});

export const getMessage = query({
	args: { id: v.id("messages") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getMessageWithChildren = query({
	args: { id: v.id("messages") },
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.id);
		if (!message) return null;
		const [user, character, replies] = await Promise.all([
			ctx.db.get(message.userId),
			message.characterId ? ctx.db.get(message.characterId) : null,
			ctx.db
				.query("messages")
				.withIndex("by_campaignId_and_parentMessageId", (q) =>
					q.eq("campaignId", message.campaignId).eq("parentMessageId", args.id),
				)
				.take(50),
		]);
		return { message, user, character, replies };
	},
});

export const createMessage = mutation({
	args: {
		body: v.string(),
		userId: v.id("users"),
		campaignId: v.id("campaigns"),
		characterId: v.optional(v.id("characters")),
		parentMessageId: v.optional(v.id("messages")),
		visibility: v.optional(visibility),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("messages", {
			body: args.body,
			userId: args.userId,
			campaignId: args.campaignId,
			characterId: args.characterId,
			parentMessageId: args.parentMessageId,
			visibility: args.visibility ?? "public",
			updatedAt: Date.now(),
		});
	},
});

export const updateMessage = mutation({
	args: {
		id: v.id("messages"),
		body: v.optional(v.string()),
		characterId: v.optional(v.id("characters")),
		parentMessageId: v.optional(v.id("messages")),
		visibility: v.optional(visibility),
	},
	handler: async (ctx, args) => {
		const { id, ...patch } = args;
		await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
		return id;
	},
});

export const deleteMessage = mutation({
	args: { id: v.id("messages") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return args.id;
	},
});
