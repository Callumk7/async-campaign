import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getLocations = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("locations").take(50);
	},
});

export const getLocationsByCampaign = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("locations")
			.withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
			.take(100);
	},
});

export const getLocationsByParent = query({
	args: { parentLocationId: v.id("locations") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("locations")
			.withIndex("by_parentLocationId", (q) => q.eq("parentLocationId", args.parentLocationId))
			.take(100);
	},
});

export const getLocationsByCampaignAndParent = query({
	args: { campaignId: v.id("campaigns"), parentLocationId: v.optional(v.id("locations")) },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("locations")
			.withIndex("by_campaignId_and_parentLocationId", (q) =>
				q.eq("campaignId", args.campaignId).eq("parentLocationId", args.parentLocationId),
			)
			.take(100);
	},
});

export const getLocation = query({
	args: { id: v.id("locations") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getLocationWithChildren = query({
	args: { id: v.id("locations") },
	handler: async (ctx, args) => {
		const location = await ctx.db.get(args.id);
		if (!location) return null;
		const [children, characters, notes] = await Promise.all([
			ctx.db
				.query("locations")
				.withIndex("by_parentLocationId", (q) => q.eq("parentLocationId", args.id))
				.take(100),
			ctx.db
				.query("characters")
				.withIndex("by_locationId", (q) => q.eq("locationId", args.id))
				.take(100),
			ctx.db
				.query("notes")
				.withIndex("by_locationId", (q) => q.eq("locationId", args.id))
				.order("desc")
				.take(50),
		]);
		return { location, children, characters, notes };
	},
});

export const createLocation = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		campaignId: v.id("campaigns"),
		parentLocationId: v.optional(v.id("locations")),
		imageUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("locations", {
			name: args.name,
			description: args.description,
			campaignId: args.campaignId,
			parentLocationId: args.parentLocationId,
			imageUrl: args.imageUrl,
			updatedAt: Date.now(),
		});
	},
});

export const updateLocation = mutation({
	args: {
		id: v.id("locations"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		campaignId: v.optional(v.id("campaigns")),
		parentLocationId: v.optional(v.id("locations")),
		imageUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, ...patch } = args;
		await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
		return id;
	},
});

export const deleteLocation = mutation({
	args: { id: v.id("locations") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return args.id;
	},
});
