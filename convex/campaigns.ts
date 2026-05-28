import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const campaignStatus = v.union(v.literal("active"), v.literal("paused"), v.literal("archived"));

export const getCampaigns = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("campaigns").take(50);
	},
});

export const getCampaignsByOwner = query({
	args: { ownerId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("campaigns")
			.withIndex("by_ownerId", (q) => q.eq("ownerId", args.ownerId))
			.take(50);
	},
});

export const getCampaignsByStatus = query({
	args: { status: campaignStatus },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("campaigns")
			.withIndex("by_status", (q) => q.eq("status", args.status))
			.take(50);
	},
});

export const getCampaign = query({
	args: { id: v.id("campaigns") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getCampaignWithChildren = query({
	args: { id: v.id("campaigns") },
	handler: async (ctx, args) => {
		const campaign = await ctx.db.get(args.id);
		if (!campaign) return null;

		const [memberships, characters, decisionNodes, locations, factions, notes, messages] = await Promise.all([
			ctx.db
				.query("campaignMembers")
				.withIndex("by_campaignId", (q) => q.eq("campaignId", args.id))
				.take(100),
			ctx.db
				.query("characters")
				.withIndex("by_campaignId", (q) => q.eq("campaignId", args.id))
				.take(100),
			ctx.db
				.query("decisionNodes")
				.withIndex("by_campaignId", (q) => q.eq("campaignId", args.id))
				.take(100),
			ctx.db
				.query("locations")
				.withIndex("by_campaignId", (q) => q.eq("campaignId", args.id))
				.take(100),
			ctx.db
				.query("factions")
				.withIndex("by_campaignId", (q) => q.eq("campaignId", args.id))
				.take(100),
			ctx.db
				.query("notes")
				.withIndex("by_campaignId", (q) => q.eq("campaignId", args.id))
				.order("desc")
				.take(50),
			ctx.db
				.query("messages")
				.withIndex("by_campaignId", (q) => q.eq("campaignId", args.id))
				.order("desc")
				.take(50),
		]);

		return { campaign, memberships, characters, decisionNodes, locations, factions, notes, messages: messages.reverse() };
	},
});

export const getCampaignMembers = query({
	args: { id: v.id("campaigns") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("campaignMembers")
			.withIndex("by_campaignId", (q) => q.eq("campaignId", args.id))
			.take(100);
	},
});

export const createCampaign = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		ownerId: v.optional(v.id("users")),
		status: v.optional(campaignStatus),
		currentDecisionNodeId: v.optional(v.id("decisionNodes")),
		coverImageUrl: v.optional(v.string()),
		members: v.optional(v.array(v.id("characters"))),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("campaigns", {
			name: args.name,
			description: args.description,
			ownerId: args.ownerId,
			status: args.status ?? "active",
			currentDecisionNodeId: args.currentDecisionNodeId,
			coverImageUrl: args.coverImageUrl,
			members: args.members,
			updatedAt: Date.now(),
		});
	},
});

export const updateCampaign = mutation({
	args: {
		id: v.id("campaigns"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		ownerId: v.optional(v.id("users")),
		status: v.optional(campaignStatus),
		currentDecisionNodeId: v.optional(v.id("decisionNodes")),
		coverImageUrl: v.optional(v.string()),
		members: v.optional(v.array(v.id("characters"))),
	},
	handler: async (ctx, args) => {
		const { id, ...patch } = args;
		await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
		return id;
	},
});

export const deleteCampaign = mutation({
	args: { id: v.id("campaigns") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return args.id;
	},
});
