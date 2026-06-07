import { defineTable } from "convex/server";
import { v } from "convex/values";

import { characterStatus } from "./validators";

export const charactersSchema = defineTable({
	name: v.string(),
	description: v.optional(v.string()),
	playerId: v.id("users"),
	campaignId: v.id("campaigns"),
	locationId: v.optional(v.id("locations")),
	avatarUrl: v.optional(v.string()),
	status: v.optional(characterStatus),
	updatedAt: v.optional(v.number()),
})
	.index("by_campaignId", ["campaignId"])
	.index("by_playerId", ["playerId"])
	.index("by_locationId", ["locationId"])
	.index("by_campaignId_and_locationId", ["campaignId", "locationId"])
	.index("by_playerId_and_campaignId", ["playerId", "campaignId"]);
