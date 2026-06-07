import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const characterStatus = v.union(v.literal("active"), v.literal("inactive"), v.literal("dead"), v.literal("retired"));

export const getCharacters = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("characters").take(50);
	},
});

export const getCharactersByCampaign = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("characters")
			.withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
			.take(100);
	},
});

export const getCharactersByPlayer = query({
	args: { playerId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("characters")
			.withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
			.take(100);
	},
});

export const getCharactersByPlayerAndCampaign = query({
	args: { playerId: v.id("users"), campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("characters")
			.withIndex("by_playerId_and_campaignId", (q) => q.eq("playerId", args.playerId).eq("campaignId", args.campaignId))
			.take(100);
	},
});

export const getCharactersByLocation = query({
	args: { locationId: v.id("locations") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("characters")
			.withIndex("by_locationId", (q) => q.eq("locationId", args.locationId))
			.take(100);
	},
});

export const getCharactersByCampaignAndLocation = query({
	args: { campaignId: v.id("campaigns"), locationId: v.optional(v.id("locations")) },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("characters")
			.withIndex("by_campaignId_and_locationId", (q) =>
				q.eq("campaignId", args.campaignId).eq("locationId", args.locationId),
			)
			.take(100);
	},
});

export const getCharacter = query({
	args: { id: v.id("characters") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getCharacterWithResources = query({
	args: { id: v.id("characters") },
	handler: async (ctx, args) => {
		const character = await ctx.db.get(args.id);
		if (!character) return null;

		const resources = await ctx.db
			.query("characterResources")
			.withIndex("by_characterId", (q) => q.eq("characterId", args.id))
			.take(50);

		return { character, resources };
	},
});

export const getCharacterWithChildren = query({
	args: { id: v.id("characters") },
	handler: async (ctx, args) => {
		const character = await ctx.db.get(args.id);
		if (!character) return null;

		const [player, campaign, location, campaignMembership, factionMemberships, notes, messages] = await Promise.all([
			ctx.db.get(character.playerId),
			ctx.db.get(character.campaignId),
			character.locationId ? ctx.db.get(character.locationId) : null,
			ctx.db
				.query("campaignMembers")
				.withIndex("by_campaignId_and_userId", (q) => q.eq("campaignId", character.campaignId).eq("userId", character.playerId))
				.unique(),
			ctx.db
				.query("factionMembers")
				.withIndex("by_characterId", (q) => q.eq("characterId", args.id))
				.take(50),
			ctx.db
				.query("notes")
				.withIndex("by_characterId", (q) => q.eq("characterId", args.id))
				.order("desc")
				.take(50),
			ctx.db
				.query("messages")
				.withIndex("by_characterId", (q) => q.eq("characterId", args.id))
				.order("desc")
				.take(50),
		]);

		return { character, player, campaign, location, campaignMembership, factionMemberships, notes, messages: messages.reverse() };
	},
});

export const createCharacter = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		playerId: v.id("users"),
		campaignId: v.id("campaigns"),
		locationId: v.optional(v.id("locations")),
		avatarUrl: v.optional(v.string()),
		status: v.optional(characterStatus),
	},
	handler: async (ctx, args) => {
		const [player, campaign] = await Promise.all([ctx.db.get(args.playerId), ctx.db.get(args.campaignId)]);
		if (!player) throw new Error("Player not found.");
		if (!campaign) throw new Error("Campaign not found.");

		const membership = await ctx.db
			.query("campaignMembers")
			.withIndex("by_campaignId_and_userId", (q) => q.eq("campaignId", args.campaignId).eq("userId", args.playerId))
			.unique();

		if (!membership) {
			throw new Error("Players must be added to the campaign before creating campaign characters.");
		}

		const characterId = await ctx.db.insert("characters", {
			name: args.name,
			description: args.description,
			playerId: args.playerId,
			campaignId: args.campaignId,
			locationId: args.locationId,
			avatarUrl: args.avatarUrl,
			status: args.status ?? "active",
			updatedAt: Date.now(),
		});

		if (!membership.activeCharacterId) {
			await ctx.db.patch(membership._id, {
				activeCharacterId: characterId,
				updatedAt: Date.now(),
			});
		}

		return characterId;
	},
});

export const updateCharacter = mutation({
	args: {
		id: v.id("characters"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		playerId: v.optional(v.id("users")),
		locationId: v.optional(v.id("locations")),
		campaignId: v.optional(v.id("campaigns")),
		avatarUrl: v.optional(v.string()),
		status: v.optional(characterStatus),
	},
	handler: async (ctx, args) => {
		const character = await ctx.db.get(args.id);
		if (!character) throw new Error("Character not found.");

		const nextPlayerId = args.playerId ?? character.playerId;
		const nextCampaignId = args.campaignId ?? character.campaignId;

		if (args.playerId || args.campaignId) {
			const membership = await ctx.db
				.query("campaignMembers")
				.withIndex("by_campaignId_and_userId", (q) => q.eq("campaignId", nextCampaignId).eq("userId", nextPlayerId))
				.unique();
			if (!membership) throw new Error("Character owner must be a member of the campaign.");
		}

		const { id, ...patch } = args;
		await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
		return id;
	},
});

export const deleteCharacter = mutation({
	args: { id: v.id("characters") },
	handler: async (ctx, args) => {
		const character = await ctx.db.get(args.id);
		if (!character) return args.id;

		const membership = await ctx.db
			.query("campaignMembers")
			.withIndex("by_campaignId_and_userId", (q) => q.eq("campaignId", character.campaignId).eq("userId", character.playerId))
			.unique();

		if (membership?.activeCharacterId === args.id) {
			await ctx.db.patch(membership._id, { activeCharacterId: undefined, updatedAt: Date.now() });
		}

		await ctx.db.delete(args.id);
		return args.id;
	},
});
