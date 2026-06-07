import { defineTable } from "convex/server";
import { v } from "convex/values";

import {
	decisionNodeStatus,
	decisionOptionAvailabilityStatus,
	decisionOptionSelectionStatus,
	decisionOptionStatus,
} from "./validators";

export const decisionNodesSchema = defineTable({
	name: v.string(),
	content: v.string(),
	campaignId: v.id("campaigns"),
	roomId: v.id("rooms"),
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
	.index("by_campaignId_and_decisionTreeId", ["campaignId", "decisionTreeId"]);

export const decisionOptionsSchema = defineTable({
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
	.index("by_decisionNodeId_and_status", ["decisionNodeId", "status"]);

export const decisionOptionAvailabilitiesSchema = defineTable({
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
	.index("by_campaignId_and_characterId", ["campaignId", "characterId"]);

export const decisionOptionSelectionsSchema = defineTable({
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
	.index("by_campaignId_and_characterId", ["campaignId", "characterId"]);

export const decisionTreesSchema = defineTable({
	name: v.string(),
	description: v.optional(v.string()),
	campaignId: v.id("campaigns"),
	roomId: v.id("rooms"),
	parentDecisionTreeId: v.optional(v.id("decisionTrees")),
}).index("by_campaignId", ["campaignId"]);
