import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { createEntityRoom } from "./lib/rooms";

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

export const getTreeWithNodesAndOptions = query({
	args: { id: v.id("decisionTrees") },
	handler: async (ctx, args) => {
		const tree = await ctx.db.get(args.id)
		if (!tree) return null

		const [nodes, characters] = await Promise.all([
			ctx.db.query("decisionNodes").withIndex("by_decisionTreeId", (q) => q.eq("decisionTreeId", args.id)).take(100),
			ctx.db.query("characters").withIndex("by_campaignId", (q) => q.eq("campaignId", tree.campaignId)).take(100),
		])
		const nodeIds = new Set(nodes.map((node) => node._id))
		const options = await ctx.db
			.query("decisionOptions")
			.withIndex("by_campaignId", (q) => q.eq("campaignId", tree.campaignId))
			.take(500)
		const treeOptions = options.filter((option) => nodeIds.has(option.decisionNodeId))

		const optionIds = new Set(treeOptions.map((option) => option._id))
		const availabilities = await ctx.db
			.query("decisionOptionAvailabilities")
			.withIndex("by_campaignId_and_characterId", (q) => q.eq("campaignId", tree.campaignId))
			.take(500)
		const treeAvailabilities = availabilities.filter((availability) => optionIds.has(availability.decisionOptionId))
		const treeSelections: Doc<"decisionOptionSelections">[] = []
		for (const node of nodes) {
			const rows = await ctx.db
				.query("decisionOptionSelections")
				.withIndex("by_decisionNodeId", (q) => q.eq("decisionNodeId", node._id))
				.take(100)
			treeSelections.push(...rows)
		}

		return {
			tree,
			characters,
			nodes: nodes.map((node) => ({
				node,
				options: treeOptions
					.filter((option) => option.decisionNodeId === node._id)
					.map((option) => ({
						option,
						availabilities: treeAvailabilities.filter((availability) => availability.decisionOptionId === option._id),
						selections: treeSelections.filter((selection) => selection.decisionOptionId === option._id),
					})),
			})),
		}
	}
})

export const createTree = mutation({
	args: {
		name: v.string(),
		campaignId: v.id("campaigns"),
	},
	handler: async (ctx, args) => {
		const roomId = await createEntityRoom(ctx, {
			entityType: "tree",
			campaignId: args.campaignId,
		});

		const treeId = await ctx.db.insert("decisionTrees", {
			name: args.name,
			campaignId: args.campaignId,
			roomId,
		})

		await ctx.db.patch(roomId, { treeId })

		return treeId
	}
})
