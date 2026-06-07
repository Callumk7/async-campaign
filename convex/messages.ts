import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMessages = query({
	args: {},
	handler: async (ctx) => {
		return (await ctx.db.query("messages").order("desc").take(50)).reverse();
	},
});

export const getMessagesByRoom = query({
	args: { roomId: v.id("rooms") },
	handler: async (ctx, args) => {
		return (
			await ctx.db
				.query("messages")
				.withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
				.order("desc")
				.take(50)
		).reverse();
	},
});

export const getMessagesByCampaign = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		const rooms = await ctx.db
			.query("rooms")
			.withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
			.take(100);

		const messagesByRoom = await Promise.all(
			rooms.map((room) =>
				ctx.db
					.query("messages")
					.withIndex("by_roomId", (q) => q.eq("roomId", room._id))
					.order("desc")
					.take(50),
			),
		);

		return messagesByRoom
			.flat()
			.sort((a, b) => a._creationTime - b._creationTime)
			.slice(-50);
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

export const getMessagesByRoomAndCharacter = query({
	args: { roomId: v.id("rooms"), characterId: v.optional(v.id("characters")) },
	handler: async (ctx, args) => {
		return (
			await ctx.db
				.query("messages")
				.withIndex("by_roomId_and_characterId", (q) =>
					q.eq("roomId", args.roomId).eq("characterId", args.characterId),
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

export const getMessageWithContext = query({
	args: { id: v.id("messages") },
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.id);
		if (!message) return null;

		const [room, user, character] = await Promise.all([
			ctx.db.get(message.roomId),
			ctx.db.get(message.userId),
			message.characterId ? ctx.db.get(message.characterId) : null,
		]);

		return { message, room, user, character };
	},
});

export const createMessage = mutation({
	args: {
		body: v.string(),
		roomId: v.id("rooms"),
		userId: v.id("users"),
		characterId: v.optional(v.id("characters")),
		isDMMessage: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const [room, user, character] = await Promise.all([
			ctx.db.get(args.roomId),
			ctx.db.get(args.userId),
			args.characterId ? ctx.db.get(args.characterId) : null,
		]);

		if (!room) throw new Error("Room not found.");
		if (!user) throw new Error("User not found.");
		if (args.characterId && !character) throw new Error("Character not found.");

		return await ctx.db.insert("messages", {
			body: args.body,
			roomId: args.roomId,
			userId: args.userId,
			characterId: args.characterId,
			isDMMessage: args.isDMMessage ?? false,
		});
	},
});

export const updateMessage = mutation({
	args: {
		id: v.id("messages"),
		body: v.optional(v.string()),
		roomId: v.optional(v.id("rooms")),
		characterId: v.optional(v.id("characters")),
		isDMMessage: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const { id, ...patch } = args;
		await ctx.db.patch(id, patch);
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
