import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTrees = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		return await ctx.db.query("decisionTrees").withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId)).take(100)
	}
})

export const getTree = query({
	args: { id: v.id("decisionTrees") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id)
	}
})

export const getTreeWithChildren = query({
	args: { id: v.id("decisionTrees") },
	handler: async (ctx, args) => {
		const tree = await ctx.db.get(args.id)
		if (!tree) return null // TODO: Or throw an error?
		const children = await ctx.db.query("decisionNodes").withIndex("by_decisionTreeId", (q) => q.eq("decisionTreeId", args.id)).take(100)
		return { tree, children }
	}
})

export const createTree = mutation({
	args: {
		name: v.string(),
		campaignId: v.id("campaigns"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("decisionTrees", {
			name: args.name,
			campaignId: args.campaignId
		})
	}
})
