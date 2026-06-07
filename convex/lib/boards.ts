import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function createCampaignBoard(
	ctx: MutationCtx,
	args: {
		campaignId: Id<"campaigns">;
		name: string;
		description?: string;
	},
) {
	return await ctx.db.insert("boards", {
		campaignId: args.campaignId,
		name: args.name,
		description: args.description,
	});
}

export async function createDefaultCampaignBoard(
	ctx: MutationCtx,
	campaignId: Id<"campaigns">,
) {
	return await createCampaignBoard(ctx, {
		campaignId,
		name: "General Discussion",
		description: "Default discussion board for this campaign.",
	});
}
