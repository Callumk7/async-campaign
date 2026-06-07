import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

const decisionNodeStatus = v.union(v.literal("draft"), v.literal("active"), v.literal("resolved"), v.literal("archived"));
const decisionOptionStatus = v.union(v.literal("draft"), v.literal("active"), v.literal("disabled"), v.literal("archived"));

const decisionOptionInput = v.object({
	label: v.string(),
	description: v.optional(v.string()),
	outcomeDecisionNodeId: v.optional(v.id("decisionNodes")),
	status: v.optional(decisionOptionStatus),
	order: v.optional(v.number()),
	availableToCharacterIds: v.optional(v.array(v.id("characters"))),
});

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

export const getDecisionNodeWithOptions = query({
	args: { id: v.id("decisionNodes") },
	handler: async (ctx, args) => {
		const decisionNode = await ctx.db.get(args.id);
		if (!decisionNode) return null;

		const [children, options, selections] = await Promise.all([
			ctx.db
				.query("decisionNodes")
				.withIndex("by_campaignId_and_parentDecisionNodeId", (q) =>
					q.eq("campaignId", decisionNode.campaignId).eq("parentDecisionNodeId", args.id),
				)
				.take(100),
			ctx.db
				.query("decisionOptions")
				.withIndex("by_decisionNodeId", (q) => q.eq("decisionNodeId", args.id))
				.take(100),
			ctx.db
				.query("decisionOptionSelections")
				.withIndex("by_decisionNodeId", (q) => q.eq("decisionNodeId", args.id))
				.take(100),
		]);

		const optionAvailabilities: Doc<"decisionOptionAvailabilities">[] = [];
		for (const option of options) {
			const rows = await ctx.db
				.query("decisionOptionAvailabilities")
				.withIndex("by_decisionOptionId", (q) => q.eq("decisionOptionId", option._id))
				.take(100);
			optionAvailabilities.push(...rows);
		}

		return {
			decisionNode,
			children,
			options: options.map((option) => ({
				option,
				availabilities: optionAvailabilities.filter((availability) => availability.decisionOptionId === option._id),
				selections: selections.filter((selection) => selection.decisionOptionId === option._id),
			})),
		};
	},
});

export const createDecisionNode = mutation({
	args: {
		name: v.string(),
		content: v.string(),
		campaignId: v.id("campaigns"),
		parentDecisionNodeId: v.optional(v.id("decisionNodes")),
		decisionTreeId: v.optional(v.id("decisionTrees")),
		status: v.optional(decisionNodeStatus),
		order: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const roomId = await ctx.db.insert("rooms", {
			entityType: "decisionNode",
			campaignId: args.campaignId,
		});

		const decisionNodeId = await ctx.db.insert("decisionNodes", {
			name: args.name,
			content: args.content,
			campaignId: args.campaignId,
			roomId,
			parentDecisionNodeId: args.parentDecisionNodeId,
			decisionTreeId: args.decisionTreeId,
			status: args.status ?? "draft",
			order: args.order,
			updatedAt: Date.now(),
		});

		await ctx.db.patch(roomId, { decisionNodeId });

		return decisionNodeId;
	},
});

export const createDecisionNodeWithOptions = mutation({
	args: {
		name: v.string(),
		content: v.string(),
		campaignId: v.id("campaigns"),
		parentDecisionNodeId: v.optional(v.id("decisionNodes")),
		decisionTreeId: v.optional(v.id("decisionTrees")),
		status: v.optional(decisionNodeStatus),
		order: v.optional(v.number()),
		options: v.optional(v.array(decisionOptionInput)),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const roomId = await ctx.db.insert("rooms", {
			entityType: "decisionNode",
			campaignId: args.campaignId,
		});

		const nodeId = await ctx.db.insert("decisionNodes", {
			name: args.name,
			content: args.content,
			campaignId: args.campaignId,
			roomId,
			parentDecisionNodeId: args.parentDecisionNodeId,
			decisionTreeId: args.decisionTreeId,
			status: args.status ?? "draft",
			order: args.order,
			updatedAt: now,
		});

		await ctx.db.patch(roomId, { decisionNodeId: nodeId });

		for (const option of args.options ?? []) {
			if (option.outcomeDecisionNodeId) {
				const outcomeNode = await ctx.db.get(option.outcomeDecisionNodeId);
				if (!outcomeNode) throw new Error("Outcome decision node not found.");
				if (outcomeNode.campaignId !== args.campaignId) throw new Error("Outcome decision node does not belong to this campaign.");
			}

			const optionId = await ctx.db.insert("decisionOptions", {
				decisionNodeId: nodeId,
				campaignId: args.campaignId,
				label: option.label,
				description: option.description,
				outcomeDecisionNodeId: option.outcomeDecisionNodeId,
				status: option.status ?? "draft",
				order: option.order,
				updatedAt: now,
			});

			for (const characterId of option.availableToCharacterIds ?? []) {
				const character = await ctx.db.get(characterId);
				if (!character) throw new Error("Character not found.");
				if (character.campaignId !== args.campaignId) throw new Error("Character does not belong to this campaign.");
				await ctx.db.insert("decisionOptionAvailabilities", {
					decisionOptionId: optionId,
					decisionNodeId: nodeId,
					campaignId: args.campaignId,
					characterId,
					status: "available",
					updatedAt: now,
				});
			}
		}

		return nodeId;
	},
});

export const updateDecisionNode = mutation({
	args: {
		id: v.id("decisionNodes"),
		name: v.optional(v.string()),
		content: v.optional(v.string()),
		campaignId: v.optional(v.id("campaigns")),
		parentDecisionNodeId: v.optional(v.id("decisionNodes")),
		decisionTreeId: v.optional(v.id("decisionTrees")),
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
