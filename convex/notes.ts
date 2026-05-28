import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const visibility = v.union(v.literal("public"), v.literal("private"), v.literal("dm"));

export const getNotes = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("notes").order("desc").take(50);
	},
});

export const getNotesByCampaign = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("notes")
			.withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
			.order("desc")
			.take(100);
	},
});

export const getNotesByAuthor = query({
	args: { authorId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("notes")
			.withIndex("by_authorId", (q) => q.eq("authorId", args.authorId))
			.order("desc")
			.take(100);
	},
});

export const getNotesByCharacter = query({
	args: { characterId: v.id("characters") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("notes")
			.withIndex("by_characterId", (q) => q.eq("characterId", args.characterId))
			.order("desc")
			.take(100);
	},
});

export const getNotesByLocation = query({
	args: { locationId: v.id("locations") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("notes")
			.withIndex("by_locationId", (q) => q.eq("locationId", args.locationId))
			.order("desc")
			.take(100);
	},
});

export const getNotesByFaction = query({
	args: { factionId: v.id("factions") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("notes")
			.withIndex("by_factionId", (q) => q.eq("factionId", args.factionId))
			.order("desc")
			.take(100);
	},
});

export const getNotesByCampaignAndParent = query({
	args: { campaignId: v.id("campaigns"), parentNoteId: v.optional(v.id("notes")) },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("notes")
			.withIndex("by_campaignId_and_parentNoteId", (q) =>
				q.eq("campaignId", args.campaignId).eq("parentNoteId", args.parentNoteId),
			)
			.order("desc")
			.take(100);
	},
});

export const getNote = query({
	args: { id: v.id("notes") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getNoteWithChildren = query({
	args: { id: v.id("notes") },
	handler: async (ctx, args) => {
		const note = await ctx.db.get(args.id);
		if (!note) return null;
		const [author, character, location, faction, replies] = await Promise.all([
			ctx.db.get(note.authorId),
			note.characterId ? ctx.db.get(note.characterId) : null,
			note.locationId ? ctx.db.get(note.locationId) : null,
			note.factionId ? ctx.db.get(note.factionId) : null,
			ctx.db
				.query("notes")
				.withIndex("by_campaignId_and_parentNoteId", (q) =>
					q.eq("campaignId", note.campaignId).eq("parentNoteId", args.id),
				)
				.take(50),
		]);
		return { note, author, character, location, faction, replies };
	},
});

export const createNote = mutation({
	args: {
		title: v.string(),
		content: v.string(),
		authorId: v.id("users"),
		campaignId: v.id("campaigns"),
		characterId: v.optional(v.id("characters")),
		locationId: v.optional(v.id("locations")),
		factionId: v.optional(v.id("factions")),
		parentNoteId: v.optional(v.id("notes")),
		visibility: v.optional(visibility),
		tags: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("notes", {
			...args,
			visibility: args.visibility ?? "private",
			updatedAt: Date.now(),
		});
	},
});

export const updateNote = mutation({
	args: {
		id: v.id("notes"),
		title: v.optional(v.string()),
		content: v.optional(v.string()),
		characterId: v.optional(v.id("characters")),
		locationId: v.optional(v.id("locations")),
		factionId: v.optional(v.id("factions")),
		parentNoteId: v.optional(v.id("notes")),
		visibility: v.optional(visibility),
		tags: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const { id, ...patch } = args;
		await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
		return id;
	},
});

export const deleteNote = mutation({
	args: { id: v.id("notes") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return args.id;
	},
});
