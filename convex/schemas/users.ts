import { defineTable } from "convex/server";
import { v } from "convex/values";

import { userRole } from "./validators";

export const usersSchema = defineTable({
	name: v.string(),
	role: userRole,
	externalId: v.optional(v.string()),
	email: v.optional(v.string()),
	avatarUrl: v.optional(v.string()),
	updatedAt: v.optional(v.number()),
})
	.index("by_externalId", ["externalId"])
	.index("by_role", ["role"]);
