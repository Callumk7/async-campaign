import { defineTable } from "convex/server";
import { v } from "convex/values";

import { campaignStatus } from "./validators";

export const campaignSchema = defineTable({
	name: v.string(),
	description: v.optional(v.string()),
	ownerId: v.optional(v.id("users")),
	status: v.optional(campaignStatus),
	currentDecisionNodeId: v.optional(v.id("decisionNodes")),
	coverImageUrl: v.optional(v.string()),
	updatedAt: v.optional(v.number()),
	roomId: v.id("rooms"),
})
	.index("by_ownerId", ["ownerId"])
	.index("by_status", ["status"]);

export const campaignDiscussionBoardSchema = defineTable({
	campaignId: v.id("campaigns"),
	name: v.string(),
	description: v.optional(v.string()),
}).index("by_campaign", ["campaignId"]);

export const boardPostSchema = defineTable({
	boardId: v.id("boards"),
	title: v.string(),
	body: v.string(),
	authorId: v.id("users"),
	updatedAt: v.number(),
}).index("by_boardId", ["boardId"]);

export const boardPostReplySchema = defineTable({
	postId: v.id("boardPosts"),
	body: v.string(),
	authorId: v.id("users"),
	updatedAt: v.number(),
}).index("by_postId", ["postId"]);
