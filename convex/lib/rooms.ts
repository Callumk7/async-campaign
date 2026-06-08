import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

type RoomEntityType = "campaign" | "decisionNode" | "tree";

export async function createEntityRoom(
	ctx: MutationCtx,
	args: {
		entityType: RoomEntityType;
		campaignId?: Id<"campaigns">;
	},
) {
	return await ctx.db.insert("rooms", {
		entityType: args.entityType,
		...(args.campaignId ? { campaignId: args.campaignId } : {}),
	});
}
