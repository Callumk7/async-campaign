import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

const decisionOptionStatus = v.union(v.literal("draft"), v.literal("active"), v.literal("disabled"), v.literal("archived"));
const decisionOptionAvailabilityStatus = v.union(v.literal("available"), v.literal("hidden"), v.literal("disabled"));
const decisionOptionSelectionStatus = v.union(v.literal("selected"), v.literal("retracted"), v.literal("locked"));

const availabilityInput = v.object({
	characterId: v.id("characters"),
	status: v.optional(decisionOptionAvailabilityStatus),
	reason: v.optional(v.string()),
});

async function assertNodeInCampaign(
	ctx: QueryCtx | MutationCtx,
	decisionNodeId: Id<"decisionNodes">,
	campaignId: Id<"campaigns">,
) {
	const node = await ctx.db.get(decisionNodeId);
	if (!node) throw new Error("Decision node not found.");
	if (node.campaignId !== campaignId) throw new Error("Decision node does not belong to this campaign.");
	return node;
}

export const getDecisionOptionsByNode = query({
	args: { decisionNodeId: v.id("decisionNodes") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("decisionOptions")
			.withIndex("by_decisionNodeId", (q) => q.eq("decisionNodeId", args.decisionNodeId))
			.take(100);
	},
});

export const getDecisionOption = query({
	args: { id: v.id("decisionOptions") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getDecisionOptionsWithCharacterState = query({
	args: { decisionNodeId: v.id("decisionNodes"), characterId: v.id("characters") },
	handler: async (ctx, args) => {
		const [options, availabilities, selections] = await Promise.all([
			ctx.db
				.query("decisionOptions")
				.withIndex("by_decisionNodeId", (q) => q.eq("decisionNodeId", args.decisionNodeId))
				.take(100),
			ctx.db
				.query("decisionOptionAvailabilities")
				.withIndex("by_decisionNodeId_and_characterId", (q) =>
					q.eq("decisionNodeId", args.decisionNodeId).eq("characterId", args.characterId),
				)
				.take(100),
			ctx.db
				.query("decisionOptionSelections")
				.withIndex("by_decisionNodeId_and_characterId", (q) =>
					q.eq("decisionNodeId", args.decisionNodeId).eq("characterId", args.characterId),
				)
				.take(100),
		]);

		return options.map((option) => ({
			option,
			availability: availabilities.find((availability) => availability.decisionOptionId === option._id) ?? null,
			selection: selections.find((selection) => selection.decisionOptionId === option._id) ?? null,
		}));
	},
});

export const createDecisionOption = mutation({
	args: {
		decisionNodeId: v.id("decisionNodes"),
		campaignId: v.id("campaigns"),
		label: v.string(),
		description: v.optional(v.string()),
		outcomeDecisionNodeId: v.optional(v.id("decisionNodes")),
		status: v.optional(decisionOptionStatus),
		order: v.optional(v.number()),
		availableTo: v.optional(v.array(availabilityInput)),
	},
	handler: async (ctx, args) => {
		await assertNodeInCampaign(ctx, args.decisionNodeId, args.campaignId);
		if (args.outcomeDecisionNodeId) {
			await assertNodeInCampaign(ctx, args.outcomeDecisionNodeId, args.campaignId);
		}

		for (const availability of args.availableTo ?? []) {
			const character = await ctx.db.get(availability.characterId);
			if (!character) throw new Error("Character not found.");
			if (character.campaignId !== args.campaignId) throw new Error("Character does not belong to this campaign.");
		}

		const now = Date.now();
		const optionId = await ctx.db.insert("decisionOptions", {
			decisionNodeId: args.decisionNodeId,
			campaignId: args.campaignId,
			label: args.label,
			description: args.description,
			outcomeDecisionNodeId: args.outcomeDecisionNodeId,
			status: args.status ?? "draft",
			order: args.order,
			updatedAt: now,
		});

		for (const availability of args.availableTo ?? []) {
			await ctx.db.insert("decisionOptionAvailabilities", {
				decisionOptionId: optionId,
				decisionNodeId: args.decisionNodeId,
				campaignId: args.campaignId,
				characterId: availability.characterId,
				status: availability.status ?? "available",
				reason: availability.reason,
				updatedAt: now,
			});
		}

		return optionId;
	},
});

export const updateDecisionOption = mutation({
	args: {
		id: v.id("decisionOptions"),
		label: v.optional(v.string()),
		description: v.optional(v.string()),
		outcomeDecisionNodeId: v.optional(v.id("decisionNodes")),
		status: v.optional(decisionOptionStatus),
		order: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const option = await ctx.db.get(args.id);
		if (!option) throw new Error("Decision option not found.");
		if (args.outcomeDecisionNodeId) {
			await assertNodeInCampaign(ctx, args.outcomeDecisionNodeId, option.campaignId);
		}

		const { id, ...patch } = args;
		await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
		return id;
	},
});

export const setDecisionOptionAvailability = mutation({
	args: {
		decisionOptionId: v.id("decisionOptions"),
		characterId: v.id("characters"),
		status: decisionOptionAvailabilityStatus,
		reason: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const [option, character] = await Promise.all([ctx.db.get(args.decisionOptionId), ctx.db.get(args.characterId)]);
		if (!option) throw new Error("Decision option not found.");
		if (!character) throw new Error("Character not found.");
		if (character.campaignId !== option.campaignId) throw new Error("Character does not belong to this campaign.");

		const existing = await ctx.db
			.query("decisionOptionAvailabilities")
			.withIndex("by_decisionOptionId_and_characterId", (q) =>
				q.eq("decisionOptionId", args.decisionOptionId).eq("characterId", args.characterId),
			)
			.unique();

		const now = Date.now();
		if (existing) {
			await ctx.db.patch(existing._id, { status: args.status, reason: args.reason, updatedAt: now });
			return existing._id;
		}

		return await ctx.db.insert("decisionOptionAvailabilities", {
			decisionOptionId: args.decisionOptionId,
			decisionNodeId: option.decisionNodeId,
			campaignId: option.campaignId,
			characterId: args.characterId,
			status: args.status,
			reason: args.reason,
			updatedAt: now,
		});
	},
});

export const selectDecisionOption = mutation({
	args: {
		decisionOptionId: v.id("decisionOptions"),
		characterId: v.id("characters"),
		selectedByUserId: v.optional(v.id("users")),
		note: v.optional(v.string()),
		replaceExisting: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const [option, character] = await Promise.all([ctx.db.get(args.decisionOptionId), ctx.db.get(args.characterId)]);
		if (!option) throw new Error("Decision option not found.");
		if (!character) throw new Error("Character not found.");
		if (character.campaignId !== option.campaignId) throw new Error("Character does not belong to this campaign.");
		if (option.status === "disabled" || option.status === "archived") throw new Error("Decision option is not selectable.");

		const availability = await ctx.db
			.query("decisionOptionAvailabilities")
			.withIndex("by_decisionOptionId_and_characterId", (q) =>
				q.eq("decisionOptionId", args.decisionOptionId).eq("characterId", args.characterId),
			)
			.unique();
		const hasSpecificAvailability = await ctx.db
			.query("decisionOptionAvailabilities")
			.withIndex("by_decisionOptionId", (q) => q.eq("decisionOptionId", args.decisionOptionId))
			.take(1);
		if (hasSpecificAvailability.length > 0 && availability?.status !== "available") {
			throw new Error("Decision option is not available to this character.");
		}

		const now = Date.now();
		if (args.replaceExisting ?? true) {
			const existingSelections = await ctx.db
				.query("decisionOptionSelections")
				.withIndex("by_decisionNodeId_and_characterId", (q) =>
					q.eq("decisionNodeId", option.decisionNodeId).eq("characterId", args.characterId),
				)
				.take(50);
			for (const selection of existingSelections) {
				if (selection.status === "selected") {
					await ctx.db.patch(selection._id, { status: "retracted", updatedAt: now });
				}
			}
		}

		const existingSelection = await ctx.db
			.query("decisionOptionSelections")
			.withIndex("by_decisionOptionId_and_characterId", (q) =>
				q.eq("decisionOptionId", args.decisionOptionId).eq("characterId", args.characterId),
			)
			.unique();

		if (existingSelection) {
			await ctx.db.patch(existingSelection._id, {
				selectedByUserId: args.selectedByUserId,
				status: "selected",
				note: args.note,
				selectedAt: now,
				updatedAt: now,
			});
			return existingSelection._id;
		}

		return await ctx.db.insert("decisionOptionSelections", {
			decisionOptionId: args.decisionOptionId,
			decisionNodeId: option.decisionNodeId,
			campaignId: option.campaignId,
			characterId: args.characterId,
			selectedByUserId: args.selectedByUserId,
			status: "selected",
			note: args.note,
			selectedAt: now,
			updatedAt: now,
		});
	},
});

export const deleteDecisionOption = mutation({
	args: { id: v.id("decisionOptions") },
	handler: async (ctx, args) => {
		const [availabilities, selections] = await Promise.all([
			ctx.db
				.query("decisionOptionAvailabilities")
				.withIndex("by_decisionOptionId", (q) => q.eq("decisionOptionId", args.id))
				.take(100),
			ctx.db
				.query("decisionOptionSelections")
				.withIndex("by_decisionOptionId", (q) => q.eq("decisionOptionId", args.id))
				.take(100),
		]);
		for (const availability of availabilities) await ctx.db.delete(availability._id);
		for (const selection of selections) await ctx.db.delete(selection._id);
		await ctx.db.delete(args.id);
		return args.id;
	},
});
