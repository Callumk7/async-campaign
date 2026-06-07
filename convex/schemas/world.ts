import { defineTable } from "convex/server";
import { v } from "convex/values";

export const factionsSchema = defineTable({
	name: v.string(),
	description: v.optional(v.string()),
	campaignId: v.optional(v.id("campaigns")),
	// Prefer factionMembers for membership; kept optional for existing data compatibility.
	members: v.optional(v.array(v.id("characters"))),
	updatedAt: v.optional(v.number()),
}).index("by_campaignId", ["campaignId"]);

export const factionMembersSchema = defineTable({
	factionId: v.id("factions"),
	characterId: v.id("characters"),
	role: v.optional(v.string()),
	joinedAt: v.number(),
})
	.index("by_factionId", ["factionId"])
	.index("by_characterId", ["characterId"])
	.index("by_factionId_and_characterId", ["factionId", "characterId"]);

export const locationsSchema = defineTable({
	name: v.string(),
	description: v.optional(v.string()),
	campaignId: v.id("campaigns"),
	parentLocationId: v.optional(v.id("locations")),
	imageUrl: v.optional(v.string()),
	updatedAt: v.optional(v.number()),
})
	.index("by_campaignId", ["campaignId"])
	.index("by_parentLocationId", ["parentLocationId"])
	.index("by_campaignId_and_parentLocationId", ["campaignId", "parentLocationId"]);
