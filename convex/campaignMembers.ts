import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

const campaignRole = v.union(v.literal("admin"), v.literal("dm"), v.literal("player"), v.literal("observer"));

type CampaignRole = "admin" | "dm" | "player" | "observer";

async function canManageCampaign(ctx: MutationCtx, campaignId: Id<"campaigns">, userId: Id<"users">) {
	const [campaign, user] = await Promise.all([ctx.db.get(campaignId), ctx.db.get(userId)]);
	if (!campaign || !user) return false;
	if (user.role === "admin" || campaign.ownerId === userId) return true;

	const membership = await ctx.db
		.query("campaignMembers")
		.withIndex("by_campaignId_and_userId", (q) => q.eq("campaignId", campaignId).eq("userId", userId))
		.unique();

	return membership?.role === "admin" || membership?.role === "dm";
}

async function upsertCampaignMember(
	ctx: MutationCtx,
	args: {
		campaignId: Id<"campaigns">;
		userId: Id<"users">;
		role: CampaignRole;
		activeCharacterId?: Id<"characters">;
	},
) {
	const [campaign, user] = await Promise.all([ctx.db.get(args.campaignId), ctx.db.get(args.userId)]);
	if (!campaign) throw new Error("Campaign not found.");
	if (!user) throw new Error("User not found.");

	if (args.activeCharacterId) {
		const character = await ctx.db.get(args.activeCharacterId);
		if (!character) throw new Error("Character not found.");
		if (character.campaignId !== args.campaignId || character.playerId !== args.userId) {
			throw new Error("Active character must belong to this user and campaign.");
		}
	}

	const existingMembership = await ctx.db
		.query("campaignMembers")
		.withIndex("by_campaignId_and_userId", (q) => q.eq("campaignId", args.campaignId).eq("userId", args.userId))
		.unique();

	if (existingMembership) {
		await ctx.db.patch(existingMembership._id, {
			role: args.role,
			activeCharacterId: args.activeCharacterId ?? existingMembership.activeCharacterId,
			updatedAt: Date.now(),
		});
		return existingMembership._id;
	}

	return await ctx.db.insert("campaignMembers", {
		campaignId: args.campaignId,
		userId: args.userId,
		role: args.role,
		activeCharacterId: args.activeCharacterId,
		joinedAt: Date.now(),
		updatedAt: Date.now(),
	});
}

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

export const getCampaignRoster = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		const memberships = await ctx.db
			.query("campaignMembers")
			.withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
			.take(100);

		return await Promise.all(
			memberships.map(async (membership) => ({
				membership,
				user: await ctx.db.get(membership.userId),
				activeCharacter: membership.activeCharacterId ? await ctx.db.get(membership.activeCharacterId) : null,
			})),
		);
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

export const getCampaignMemberByCampaignAndUser = query({
	args: { campaignId: v.id("campaigns"), userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("campaignMembers")
			.withIndex("by_campaignId_and_userId", (q) => q.eq("campaignId", args.campaignId).eq("userId", args.userId))
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
		const [campaign, user, activeCharacter] = await Promise.all([
			ctx.db.get(membership.campaignId),
			ctx.db.get(membership.userId),
			membership.activeCharacterId ? ctx.db.get(membership.activeCharacterId) : null,
		]);
		return { membership, campaign, user, activeCharacter };
	},
});

export const createCampaignMember = mutation({
	args: {
		campaignId: v.id("campaigns"),
		userId: v.id("users"),
		role: v.optional(campaignRole),
		activeCharacterId: v.optional(v.id("characters")),
	},
	handler: async (ctx, args) => {
		return await upsertCampaignMember(ctx, {
			campaignId: args.campaignId,
			userId: args.userId,
			role: args.role ?? "player",
			activeCharacterId: args.activeCharacterId,
		});
	},
});

export const addUserToCampaign = mutation({
	args: {
		campaignId: v.id("campaigns"),
		userId: v.id("users"),
		role: v.optional(campaignRole),
		addedByUserId: v.optional(v.id("users")),
	},
	handler: async (ctx, args) => {
		if (args.addedByUserId) {
			const canManage = await canManageCampaign(ctx, args.campaignId, args.addedByUserId);
			if (!canManage) throw new Error("You do not have permission to add users to this campaign.");
		}

		return await upsertCampaignMember(ctx, {
			campaignId: args.campaignId,
			userId: args.userId,
			role: args.role ?? "player",
		});
	},
});

export const selectCharacterForCampaign = mutation({
	args: {
		campaignId: v.id("campaigns"),
		userId: v.id("users"),
		characterId: v.id("characters"),
	},
	handler: async (ctx, args) => {
		const [membership, character] = await Promise.all([
			ctx.db
				.query("campaignMembers")
				.withIndex("by_campaignId_and_userId", (q) => q.eq("campaignId", args.campaignId).eq("userId", args.userId))
				.unique(),
			ctx.db.get(args.characterId),
		]);

		if (!membership) throw new Error("This user is not a member of this campaign.");
		if (!character) throw new Error("Character not found.");
		if (character.campaignId !== args.campaignId || character.playerId !== args.userId) {
			throw new Error("Choose one of this user's characters in this campaign.");
		}

		await ctx.db.patch(membership._id, {
			activeCharacterId: args.characterId,
			updatedAt: Date.now(),
		});

		const updatedMembership = await ctx.db.get(membership._id);
		return { membership: updatedMembership, character };
	},
});

export const updateCampaignMember = mutation({
	args: {
		id: v.id("campaignMembers"),
		role: v.optional(campaignRole),
		activeCharacterId: v.optional(v.id("characters")),
	},
	handler: async (ctx, args) => {
		const { id, ...patch } = args;
		const membership = await ctx.db.get(id);
		if (!membership) throw new Error("Campaign membership not found.");

		if (patch.activeCharacterId) {
			const character = await ctx.db.get(patch.activeCharacterId);
			if (!character) throw new Error("Character not found.");
			if (character.campaignId !== membership.campaignId || character.playerId !== membership.userId) {
				throw new Error("Active character must belong to this member and campaign.");
			}
		}

		await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
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
