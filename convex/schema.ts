import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const userRole = v.union(v.literal("admin"), v.literal("dm"), v.literal("player"));
const campaignRole = v.union(v.literal("dm"), v.literal("player"), v.literal("observer"));
const campaignStatus = v.union(v.literal("active"), v.literal("paused"), v.literal("archived"));
const decisionNodeStatus = v.union(v.literal("draft"), v.literal("active"), v.literal("resolved"), v.literal("archived"));
const visibility = v.union(v.literal("public"), v.literal("private"), v.literal("dm"));

export default defineSchema({
	messages: defineTable({
		body: v.string(),
		userId: v.id("users"),
		campaignId: v.id("campaigns"),
		characterId: v.optional(v.id("characters")),
		parentMessageId: v.optional(v.id("messages")),
		visibility: v.optional(visibility),
		updatedAt: v.optional(v.number()),
	})
		.index("by_campaignId", ["campaignId"])
		.index("by_userId", ["userId"])
		.index("by_characterId", ["characterId"])
		.index("by_campaignId_and_characterId", ["campaignId", "characterId"])
		.index("by_campaignId_and_parentMessageId", ["campaignId", "parentMessageId"]),
	users: defineTable({
		name: v.string(),
		role: userRole,
		externalId: v.optional(v.string()),
		email: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
		updatedAt: v.optional(v.number()),
	})
		.index("by_externalId", ["externalId"])
		.index("by_role", ["role"]),
	campaigns: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		ownerId: v.optional(v.id("users")),
		status: v.optional(campaignStatus),
		currentDecisionNodeId: v.optional(v.id("decisionNodes")),
		coverImageUrl: v.optional(v.string()),
		// Prefer campaignMembers for membership; kept optional for existing data compatibility.
		members: v.optional(v.array(v.id("characters"))),
		updatedAt: v.optional(v.number()),
	})
		.index("by_ownerId", ["ownerId"])
		.index("by_status", ["status"]),
	campaignMembers: defineTable({
		campaignId: v.id("campaigns"),
		characterId: v.id("characters"),
		userId: v.optional(v.id("users")),
		role: campaignRole,
		joinedAt: v.number(),
	})
		.index("by_campaignId", ["campaignId"])
		.index("by_characterId", ["characterId"])
		.index("by_userId", ["userId"])
		.index("by_campaignId_and_characterId", ["campaignId", "characterId"]),
	decisionNodes: defineTable({
		name: v.string(),
		content: v.string(),
		campaignId: v.id("campaigns"),
		parentDecisionNodeId: v.optional(v.id("decisionNodes")),
		status: v.optional(decisionNodeStatus),
		order: v.optional(v.number()),
		updatedAt: v.optional(v.number()),
	})
		.index("by_campaignId", ["campaignId"])
		.index("by_campaignId_and_parentDecisionNodeId", ["campaignId", "parentDecisionNodeId"])
		.index("by_campaignId_and_status", ["campaignId", "status"]),
	characters: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		playerId: v.optional(v.id("users")),
		locationId: v.optional(v.id("locations")),
		campaignId: v.optional(v.id("campaigns")),
		avatarUrl: v.optional(v.string()),
		status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("dead"), v.literal("retired"))),
		updatedAt: v.optional(v.number()),
	})
		.index("by_campaignId", ["campaignId"])
		.index("by_playerId", ["playerId"])
		.index("by_locationId", ["locationId"])
		.index("by_campaignId_and_locationId", ["campaignId", "locationId"]),
	factions: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		campaignId: v.optional(v.id("campaigns")),
		// Prefer factionMembers for membership; kept optional for existing data compatibility.
		members: v.optional(v.array(v.id("characters"))),
		updatedAt: v.optional(v.number()),
	})
		.index("by_campaignId", ["campaignId"]),
	factionMembers: defineTable({
		factionId: v.id("factions"),
		characterId: v.id("characters"),
		role: v.optional(v.string()),
		joinedAt: v.number(),
	})
		.index("by_factionId", ["factionId"])
		.index("by_characterId", ["characterId"])
		.index("by_factionId_and_characterId", ["factionId", "characterId"]),
	notes: defineTable({
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
		updatedAt: v.optional(v.number()),
	})
		.index("by_campaignId", ["campaignId"])
		.index("by_authorId", ["authorId"])
		.index("by_characterId", ["characterId"])
		.index("by_locationId", ["locationId"])
		.index("by_factionId", ["factionId"])
		.index("by_campaignId_and_parentNoteId", ["campaignId", "parentNoteId"]),
	locations: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		campaignId: v.id("campaigns"),
		parentLocationId: v.optional(v.id("locations")),
		imageUrl: v.optional(v.string()),
		updatedAt: v.optional(v.number()),
	})
		.index("by_campaignId", ["campaignId"])
		.index("by_parentLocationId", ["parentLocationId"])
		.index("by_campaignId_and_parentLocationId", ["campaignId", "parentLocationId"]),
});
