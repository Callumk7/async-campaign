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

export const getByCampaignMember = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		const memberships = await ctx.db
			.query("campaignMembers")
			.withIndex("by_userId", (q) => q.eq("userId", args.userId))
			.take(50);

		const campaignsWithMemberships = await Promise.all(
			memberships.map(async (membership) => {
				const campaign = await ctx.db.get(membership.campaignId);
				if (!campaign) return null;

				return {
					campaign,
					membership,
				};
			}),
		);

		return campaignsWithMemberships.filter((item) => item !== null);
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

		const membersWithUsers = await Promise.all(
			memberships.map(async (membership) => ({
				membership,
				user: await ctx.db.get(membership.userId),
				activeCharacter: membership.activeCharacterId ? await ctx.db.get(membership.activeCharacterId) : null,
			})),
		);

		return {
			campaign,
			memberships,
			membersWithUsers,
			characters,
			decisionNodes,
			locations,
			factions,
			notes,
			messages: messages.reverse(),
		};
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
	},
	handler: async (ctx, args) => {
		if (args.ownerId) {
			const owner = await ctx.db.get(args.ownerId);
			if (!owner) throw new Error("Owner not found.");
			if (owner.role !== "admin" && owner.role !== "dm") {
				throw new Error("Only admins and DMs can create campaigns.");
			}
		}

		const campaignId = await ctx.db.insert("campaigns", {
			name: args.name,
			description: args.description,
			ownerId: args.ownerId,
			status: args.status ?? "active",
			currentDecisionNodeId: args.currentDecisionNodeId,
			coverImageUrl: args.coverImageUrl,
			updatedAt: Date.now(),
		});

		if (args.ownerId) {
			await ctx.db.insert("campaignMembers", {
				campaignId,
				userId: args.ownerId,
				role: "admin",
				joinedAt: Date.now(),
				updatedAt: Date.now(),
			});
		}

		return campaignId;
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
