import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const userRole = v.union(v.literal("admin"), v.literal("dm"), v.literal("player"))

export default defineSchema({
	messages: defineTable({
		body: v.string(),
		userId: v.id("users"),
		campaignId: v.id("campaigns"),
		characterId: v.id("characters"),
	}),
	users: defineTable({
		name: v.string(),
		role: userRole,
	}),
	campaigns: defineTable({
		name: v.string(),
		description: v.string(),
		members: v.array(v.id("users")),
	}),
	decisionNodes: defineTable({
		name: v.string(),
		content: v.string(),
		campaignId: v.id("campaigns"),
	}).index("by_campaign", ["campaignId"]),
	characters: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		playerId: v.optional(v.id("users")),
		locationId: v.optional(v.id("locations")),
	}),
	factions: defineTable({
		name: v.string(),
		members: v.array(v.id("characters")),
	}),
	notes: defineTable({
		title: v.string(),
		content: v.string(),
		authorId: v.id("users"),
		campaignId: v.id("campaigns"),
	}),
	locations: defineTable({
		name: v.string(),
		description: v.string(),
		campaignId: v.id("campaigns"),
		parentLocationId: v.optional(v.id("locations")),
	}),
});
