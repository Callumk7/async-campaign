import { defineTable } from "convex/server";
import { v } from "convex/values";

export const messagesSchema = defineTable({
	body: v.string(),
	roomId: v.id("rooms"),
	userId: v.id("users"),
	characterId: v.optional(v.id("characters")),
	isDMMessage: v.optional(v.boolean()),
})
	.index("by_roomId", ["roomId"])
	.index("by_userId", ["userId"])
	.index("by_characterId", ["characterId"])
	.index("by_roomId_and_characterId", ["roomId", "characterId"]);
