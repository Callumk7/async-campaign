import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const decisionNodeStatus = v.union(v.literal("draft"), v.literal("active"), v.literal("resolved"), v.literal("archived"));

export const getDecisionNodes = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("decisionNodes")
			.withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
			.take(100);
	},
});

export const getDecisionNodesByCampaign = getDecisionNodes;

export const getDecisionNodesByCampaignAndParent = query({
	args: { campaignId: v.id("campaigns"), parentDecisionNodeId: v.optional(v.id("decisionNodes")) },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("decisionNodes")
			.withIndex("by_campaignId_and_parentDecisionNodeId", (q) =>
				q.eq("campaignId", args.campaignId).eq("parentDecisionNodeId", args.parentDecisionNodeId),
			)
			.take(100);
	},
});

export const getDecisionNodesByCampaignAndStatus = query({
	args: { campaignId: v.id("campaigns"), status: decisionNodeStatus },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("decisionNodes")
			.withIndex("by_campaignId_and_status", (q) => q.eq("campaignId", args.campaignId).eq("status", args.status))
			.take(100);
	},
});

export const getDecisionNode = query({
	args: { id: v.id("decisionNodes") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getDecisionNodeWithChildren = query({
	args: { id: v.id("decisionNodes") },
	handler: async (ctx, args) => {
		const decisionNode = await ctx.db.get(args.id);
		if (!decisionNode) return null;
		const children = await ctx.db
			.query("decisionNodes")
			.withIndex("by_campaignId_and_parentDecisionNodeId", (q) =>
				q.eq("campaignId", decisionNode.campaignId).eq("parentDecisionNodeId", args.id),
			)
			.take(100);
		return { decisionNode, children };
	},
});

export const createDecisionNode = mutation({
	args: {
		name: v.string(),
		content: v.string(),
		campaignId: v.id("campaigns"),
		parentDecisionNodeId: v.optional(v.id("decisionNodes")),
		status: v.optional(decisionNodeStatus),
		order: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("decisionNodes", {
			name: args.name,
			content: args.content,
			campaignId: args.campaignId,
			parentDecisionNodeId: args.parentDecisionNodeId,
			status: args.status ?? "draft",
			order: args.order,
			updatedAt: Date.now(),
		});
	},
});

export const updateDecisionNode = mutation({
	args: {
		id: v.id("decisionNodes"),
		name: v.optional(v.string()),
		content: v.optional(v.string()),
		campaignId: v.optional(v.id("campaigns")),
		parentDecisionNodeId: v.optional(v.id("decisionNodes")),
		status: v.optional(decisionNodeStatus),
		order: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { id, ...patch } = args;
		await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
		return id;
	},
});

export const deleteDecisionNode = mutation({
	args: { id: v.id("decisionNodes") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return args.id;
	},
});
