import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const userRole = v.union(v.literal("admin"), v.literal("dm"), v.literal("player"));

export const getUsers = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("users").take(50);
	},
});

export const getUsersByRole = query({
	args: { role: userRole },
	handler: async (ctx, args) => {
		return await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", args.role)).take(100);
	},
});

export const getUserByExternalId = query({
	args: { externalId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
			.unique();
	},
});

export const getUser = query({
	args: { id: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getUserWithChildren = query({
	args: { id: v.id("users") },
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.id);
		if (!user) return null;
		const [characters, campaigns, memberships, notes, messages] = await Promise.all([
			ctx.db
				.query("characters")
				.withIndex("by_playerId", (q) => q.eq("playerId", args.id))
				.take(100),
			ctx.db
				.query("campaigns")
				.withIndex("by_ownerId", (q) => q.eq("ownerId", args.id))
				.take(100),
			ctx.db
				.query("campaignMembers")
				.withIndex("by_userId", (q) => q.eq("userId", args.id))
				.take(100),
			ctx.db
				.query("notes")
				.withIndex("by_authorId", (q) => q.eq("authorId", args.id))
				.order("desc")
				.take(50),
			ctx.db
				.query("messages")
				.withIndex("by_userId", (q) => q.eq("userId", args.id))
				.order("desc")
				.take(50),
		]);
		return { user, characters, campaigns, memberships, notes, messages: messages.reverse() };
	},
});

export const createUser = mutation({
	args: {
		name: v.string(),
		role: v.optional(userRole),
		externalId: v.optional(v.string()),
		email: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("users", {
			name: args.name,
			role: args.role ?? "player",
			externalId: args.externalId,
			email: args.email,
			avatarUrl: args.avatarUrl,
			updatedAt: Date.now(),
		});
	},
});

export const updateUser = mutation({
	args: {
		id: v.id("users"),
		name: v.optional(v.string()),
		role: v.optional(userRole),
		externalId: v.optional(v.string()),
		email: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, ...patch } = args;
		await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
		return id;
	},
});

export const deleteUser = mutation({
	args: { id: v.id("users") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return args.id;
	},
});
