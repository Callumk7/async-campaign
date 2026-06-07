import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const roomEntityType = v.union(v.literal("campaign"), v.literal("decisionNode"), v.literal("tree"));

export const getRooms = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("rooms").take(100);
	},
});

export const getRoomsByCampaign = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("rooms")
			.withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
			.take(100);
	},
});

export const getRoomsByEntityType = query({
	args: { entityType: roomEntityType },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("rooms")
			.withIndex("by_entityType", (q) => q.eq("entityType", args.entityType))
			.take(100);
	},
});

export const getRoomsByCampaignAndEntityType = query({
	args: { campaignId: v.id("campaigns"), entityType: roomEntityType },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("rooms")
			.withIndex("by_campaignId_and_entityType", (q) =>
				q.eq("campaignId", args.campaignId).eq("entityType", args.entityType),
			)
			.take(100);
	},
});

export const getRoom = query({
	args: { id: v.id("rooms") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getRoomWithMessages = query({
	args: { id: v.id("rooms") },
	handler: async (ctx, args) => {
		const room = await ctx.db.get(args.id);
		if (!room) return null;

		const messages = (
			await ctx.db
				.query("messages")
				.withIndex("by_roomId", (q) => q.eq("roomId", args.id))
				.order("desc")
				.take(50)
		).reverse();

		return { room, messages };
	},
});

export const createRoom = mutation({
	args: {
		entityType: roomEntityType,
		campaignId: v.id("campaigns"),
	},
	handler: async (ctx, args) => {
		const campaign = await ctx.db.get(args.campaignId);
		if (!campaign) throw new Error("Campaign not found.");

		return await ctx.db.insert("rooms", {
			entityType: args.entityType,
			campaignId: args.campaignId,
		});
	},
});

export const updateRoom = mutation({
	args: {
		id: v.id("rooms"),
		entityType: v.optional(roomEntityType),
		campaignId: v.optional(v.id("campaigns")),
	},
	handler: async (ctx, args) => {
		const { id, ...patch } = args;

		if (patch.campaignId) {
			const campaign = await ctx.db.get(patch.campaignId);
			if (!campaign) throw new Error("Campaign not found.");
		}

		await ctx.db.patch(id, patch);
		return id;
	},
});

export const deleteRoom = mutation({
	args: { id: v.id("rooms") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return args.id;
	},
});
