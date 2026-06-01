import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const userRole = v.union(v.literal("admin"), v.literal("dm"), v.literal("player"));
const campaignRole = v.union(v.literal("admin"), v.literal("dm"), v.literal("player"), v.literal("observer"));
const campaignStatus = v.union(v.literal("active"), v.literal("paused"), v.literal("archived"));
const decisionNodeStatus = v.union(v.literal("draft"), v.literal("active"), v.literal("resolved"), v.literal("archived"));
const decisionOptionStatus = v.union(v.literal("draft"), v.literal("active"), v.literal("disabled"), v.literal("archived"));
const decisionOptionAvailabilityStatus = v.union(v.literal("available"), v.literal("hidden"), v.literal("disabled"));
const decisionOptionSelectionStatus = v.union(v.literal("selected"), v.literal("retracted"), v.literal("locked"));
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
		updatedAt: v.optional(v.number()),
	})
		.index("by_ownerId", ["ownerId"])
		.index("by_status", ["status"]),
	campaignMembers: defineTable({
		campaignId: v.id("campaigns"),
		userId: v.id("users"),
		role: campaignRole,
		activeCharacterId: v.optional(v.id("characters")),
		joinedAt: v.number(),
		updatedAt: v.optional(v.number()),
	})
		.index("by_campaignId", ["campaignId"])
		.index("by_userId", ["userId"])
		.index("by_activeCharacterId", ["activeCharacterId"])
		.index("by_campaignId_and_userId", ["campaignId", "userId"]),
	decisionNodes: defineTable({
		name: v.string(),
		content: v.string(),
		campaignId: v.id("campaigns"),
		parentDecisionNodeId: v.optional(v.id("decisionNodes")),
		decisionTreeId: v.optional(v.id("decisionTrees")),
		status: v.optional(decisionNodeStatus),
		order: v.optional(v.number()),
		updatedAt: v.optional(v.number()),
	})
		.index("by_campaignId", ["campaignId"])
		.index("by_campaignId_and_parentDecisionNodeId", ["campaignId", "parentDecisionNodeId"])
		.index("by_campaignId_and_status", ["campaignId", "status"])
		.index("by_decisionTreeId", ["decisionTreeId"])
		.index("by_campaignId_and_decisionTreeId", ["campaignId", "decisionTreeId"]),
	decisionOptions: defineTable({
		decisionNodeId: v.id("decisionNodes"),
		campaignId: v.id("campaigns"),
		label: v.string(),
		description: v.optional(v.string()),
		outcomeDecisionNodeId: v.optional(v.id("decisionNodes")),
		status: v.optional(decisionOptionStatus),
		order: v.optional(v.number()),
		updatedAt: v.optional(v.number()),
	})
		.index("by_campaignId", ["campaignId"])
		.index("by_decisionNodeId", ["decisionNodeId"])
		.index("by_campaignId_and_decisionNodeId", ["campaignId", "decisionNodeId"])
		.index("by_decisionNodeId_and_status", ["decisionNodeId", "status"]),
	decisionOptionAvailabilities: defineTable({
		decisionOptionId: v.id("decisionOptions"),
		decisionNodeId: v.id("decisionNodes"),
		campaignId: v.id("campaigns"),
		characterId: v.id("characters"),
		status: v.optional(decisionOptionAvailabilityStatus),
		reason: v.optional(v.string()),
		updatedAt: v.optional(v.number()),
	})
		.index("by_decisionOptionId", ["decisionOptionId"])
		.index("by_characterId", ["characterId"])
		.index("by_decisionOptionId_and_characterId", ["decisionOptionId", "characterId"])
		.index("by_decisionNodeId_and_characterId", ["decisionNodeId", "characterId"])
		.index("by_campaignId_and_characterId", ["campaignId", "characterId"]),
	decisionOptionSelections: defineTable({
		decisionOptionId: v.id("decisionOptions"),
		decisionNodeId: v.id("decisionNodes"),
		campaignId: v.id("campaigns"),
		characterId: v.id("characters"),
		selectedByUserId: v.optional(v.id("users")),
		status: v.optional(decisionOptionSelectionStatus),
		note: v.optional(v.string()),
		selectedAt: v.number(),
		updatedAt: v.optional(v.number()),
	})
		.index("by_decisionOptionId", ["decisionOptionId"])
		.index("by_characterId", ["characterId"])
		.index("by_decisionNodeId", ["decisionNodeId"])
		.index("by_decisionOptionId_and_characterId", ["decisionOptionId", "characterId"])
		.index("by_decisionNodeId_and_characterId", ["decisionNodeId", "characterId"])
		.index("by_decisionNodeId_and_status", ["decisionNodeId", "status"])
		.index("by_campaignId_and_characterId", ["campaignId", "characterId"]),
	decisionTrees: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		campaignId: v.id("campaigns"),
		parentDecisionTreeId: v.optional(v.id("decisionTrees")),
	}).index("by_campaignId", ["campaignId"]),
	characters: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		playerId: v.id("users"),
		campaignId: v.id("campaigns"),
		locationId: v.optional(v.id("locations")),
		avatarUrl: v.optional(v.string()),
		status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("dead"), v.literal("retired"))),
		updatedAt: v.optional(v.number()),
	})
		.index("by_campaignId", ["campaignId"])
		.index("by_playerId", ["playerId"])
		.index("by_locationId", ["locationId"])
		.index("by_campaignId_and_locationId", ["campaignId", "locationId"])
		.index("by_playerId_and_campaignId", ["playerId", "campaignId"]),
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
