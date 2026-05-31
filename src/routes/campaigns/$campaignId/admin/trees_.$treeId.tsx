import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export const Route = createFileRoute(
	"/campaigns/$campaignId/admin/trees_/$treeId",
)({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			convexQuery(api.trees.getTreeWithChildren, {
				id: params.treeId as Id<"decisionTrees">,
			}),
		);
	},
});

function RouteComponent() {
	const treeId = Route.useParams().treeId as Id<"decisionTrees">;
	const { data } = useSuspenseQuery(
		convexQuery(api.trees.getTreeWithChildren, { id: treeId }),
	);
	return <div>Hello "/campaigns/$campaignId/admin/trees_/$treeId"!</div>;
}
