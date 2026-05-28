import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getFactions = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("factions").take(50);
	},
});

export const getFactionsByCampaign = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("factions")
			.withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
			.take(100);
	},
});

export const getFaction = query({
	args: { id: v.id("factions") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getFactionWithChildren = query({
	args: { id: v.id("factions") },
	handler: async (ctx, args) => {
		const faction = await ctx.db.get(args.id);
		if (!faction) return null;
		const [memberships, notes] = await Promise.all([
			ctx.db
				.query("factionMembers")
				.withIndex("by_factionId", (q) => q.eq("factionId", args.id))
				.take(100),
			ctx.db
				.query("notes")
				.withIndex("by_factionId", (q) => q.eq("factionId", args.id))
				.order("desc")
				.take(50),
		]);
		const memberCharacters = await Promise.all(memberships.map((member) => ctx.db.get(member.characterId)));
		return { faction, memberships, memberCharacters: memberCharacters.filter(Boolean), notes };
	},
});

export const createFaction = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		campaignId: v.optional(v.id("campaigns")),
		members: v.optional(v.array(v.id("characters"))),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("factions", {
			name: args.name,
			description: args.description,
			campaignId: args.campaignId,
			members: args.members,
			updatedAt: Date.now(),
		});
	},
});

export const updateFaction = mutation({
	args: {
		id: v.id("factions"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		campaignId: v.optional(v.id("campaigns")),
		members: v.optional(v.array(v.id("characters"))),
	},
	handler: async (ctx, args) => {
		const { id, ...patch } = args;
		await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
		return id;
	},
});

export const deleteFaction = mutation({
	args: { id: v.id("factions") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return args.id;
	},
});
