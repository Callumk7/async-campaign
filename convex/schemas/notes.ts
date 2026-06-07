import { defineTable } from "convex/server";
import { v } from "convex/values";

import { visibility } from "./validators";

export const notesSchema = defineTable({
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
	.index("by_campaignId_and_parentNoteId", ["campaignId", "parentNoteId"]);
