import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const campaignRole = v.union(v.literal("dm"), v.literal("player"), v.literal("observer"));

export const getCampaignMembers = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("campaignMembers").take(50);
	},
});

export const getCampaignMembersByCampaign = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("campaignMembers")
			.withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
			.take(100);
	},
});

export const getCampaignMembersByCharacter = query({
	args: { characterId: v.id("characters") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("campaignMembers")
			.withIndex("by_characterId", (q) => q.eq("characterId", args.characterId))
			.take(100);
	},
});

export const getCampaignMembersByUser = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("campaignMembers")
			.withIndex("by_userId", (q) => q.eq("userId", args.userId))
			.take(100);
	},
});

export const getCampaignMemberByCampaignAndCharacter = query({
	args: { campaignId: v.id("campaigns"), characterId: v.id("characters") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("campaignMembers")
			.withIndex("by_campaignId_and_characterId", (q) =>
				q.eq("campaignId", args.campaignId).eq("characterId", args.characterId),
			)
			.unique();
	},
});

export const getCampaignMember = query({
	args: { id: v.id("campaignMembers") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getCampaignMemberWithChildren = query({
	args: { id: v.id("campaignMembers") },
	handler: async (ctx, args) => {
		const membership = await ctx.db.get(args.id);
		if (!membership) return null;
		const [campaign, character, user] = await Promise.all([
			ctx.db.get(membership.campaignId),
			ctx.db.get(membership.characterId),
			membership.userId ? ctx.db.get(membership.userId) : null,
		]);
		return { membership, campaign, character, user };
	},
});

export const createCampaignMember = mutation({
	args: {
		campaignId: v.id("campaigns"),
		characterId: v.id("characters"),
		userId: v.optional(v.id("users")),
		role: v.optional(campaignRole),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("campaignMembers", {
			campaignId: args.campaignId,
			characterId: args.characterId,
			userId: args.userId,
			role: args.role ?? "player",
			joinedAt: Date.now(),
		});
	},
});

export const updateCampaignMember = mutation({
	args: {
		id: v.id("campaignMembers"),
		userId: v.optional(v.id("users")),
		role: v.optional(campaignRole),
	},
	handler: async (ctx, args) => {
		const { id, ...patch } = args;
		await ctx.db.patch(id, patch);
		return id;
	},
});

export const deleteCampaignMember = mutation({
	args: { id: v.id("campaignMembers") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return args.id;
	},
});
