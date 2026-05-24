import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const userRole = v.union(v.literal("admin"), v.literal("dm"), v.literal("player"))

export default defineSchema({
	messages: defineTable({
		body: v.string(),
		user: v.id("users"),
	}),
	users: defineTable({
		name: v.string(),
		role: userRole,
	})
});
