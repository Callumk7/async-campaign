import { defineTable } from "convex/server";
import { v } from "convex/values";

export const questsSchema = defineTable({
	name: v.string(),
	description: v.optional(v.string()),
	campaignId: v.id("campaigns"),
})
