import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getFactionMembers = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("factionMembers").take(50);
	},
});

export const getFactionMembersByFaction = query({
	args: { factionId: v.id("factions") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("factionMembers")
			.withIndex("by_factionId", (q) => q.eq("factionId", args.factionId))
			.take(100);
	},
});

export const getFactionMembersByCharacter = query({
	args: { characterId: v.id("characters") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("factionMembers")
			.withIndex("by_characterId", (q) => q.eq("characterId", args.characterId))
			.take(100);
	},
});

export const getFactionMemberByFactionAndCharacter = query({
	args: { factionId: v.id("factions"), characterId: v.id("characters") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("factionMembers")
			.withIndex("by_factionId_and_characterId", (q) =>
				q.eq("factionId", args.factionId).eq("characterId", args.characterId),
			)
			.unique();
	},
});

export const getFactionMember = query({
	args: { id: v.id("factionMembers") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getFactionMemberWithChildren = query({
	args: { id: v.id("factionMembers") },
	handler: async (ctx, args) => {
		const membership = await ctx.db.get(args.id);
		if (!membership) return null;
		const [faction, character] = await Promise.all([
			ctx.db.get(membership.factionId),
			ctx.db.get(membership.characterId),
		]);
		return { membership, faction, character };
	},
});

export const createFactionMember = mutation({
	args: {
		factionId: v.id("factions"),
		characterId: v.id("characters"),
		role: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("factionMembers", {
			factionId: args.factionId,
			characterId: args.characterId,
			role: args.role,
			joinedAt: Date.now(),
		});
	},
});

export const updateFactionMember = mutation({
	args: {
		id: v.id("factionMembers"),
		role: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, ...patch } = args;
		await ctx.db.patch(id, patch);
		return id;
	},
});

export const deleteFactionMember = mutation({
	args: { id: v.id("factionMembers") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return args.id;
	},
});
