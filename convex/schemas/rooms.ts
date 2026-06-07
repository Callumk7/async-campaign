import { defineTable } from "convex/server";
import { v } from "convex/values";

import { roomEntityType } from "./validators";

export const roomsSchema = defineTable({
	entityType: roomEntityType,
	campaignId: v.optional(v.id("campaigns")),
	decisionNodeId: v.optional(v.id("decisionNodes")),
	treeId: v.optional(v.id("decisionTrees")),
})
	.index("by_campaignId", ["campaignId"])
	.index("by_entityType", ["entityType"])
	.index("by_campaignId_and_entityType", ["campaignId", "entityType"]);
