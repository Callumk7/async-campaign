import { defineTable } from "convex/server";
import { v } from "convex/values";

import { campaignRole } from "./validators";

export const campaignMembersSchema = defineTable({
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
	.index("by_campaignId_and_userId", ["campaignId", "userId"]);
