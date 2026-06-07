import { v } from "convex/values";

export const userRole = v.union(v.literal("admin"), v.literal("dm"), v.literal("player"));
export const campaignRole = v.union(
	v.literal("admin"),
	v.literal("dm"),
	v.literal("player"),
	v.literal("observer"),
);
export const campaignStatus = v.union(v.literal("active"), v.literal("paused"), v.literal("archived"));
export const decisionNodeStatus = v.union(
	v.literal("draft"),
	v.literal("active"),
	v.literal("resolved"),
	v.literal("archived"),
);
export const decisionOptionStatus = v.union(
	v.literal("draft"),
	v.literal("active"),
	v.literal("disabled"),
	v.literal("archived"),
);
export const decisionOptionAvailabilityStatus = v.union(
	v.literal("available"),
	v.literal("hidden"),
	v.literal("disabled"),
);
export const decisionOptionSelectionStatus = v.union(
	v.literal("selected"),
	v.literal("retracted"),
	v.literal("locked"),
);
export const characterStatus = v.union(
	v.literal("active"),
	v.literal("inactive"),
	v.literal("dead"),
	v.literal("retired"),
);
export const roomEntityType = v.union(v.literal("campaign"), v.literal("decisionNode"), v.literal("tree"));
export const visibility = v.union(v.literal("public"), v.literal("private"), v.literal("dm"));
