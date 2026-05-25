import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/admin/$campaignId/nodes")({
	component: RouteComponent,
});

function RouteComponent() {
	const campaignId = Route.useParams().campaignId as Id<"campaigns">;
	const { data } = useQuery(
		convexQuery(api.campaigns.getCampaign, { id: campaignId }),
	);
	const { data: nodes } = useQuery(
		convexQuery(api.decisionNodes.getDecisionNodes, { campaignId }),
	);
	return (
		<div className="p-10 flex flex-col gap-4">
			<h1>Decision Nodes</h1>
			<h2>{data?.name}</h2>
			<CreateNode campaignId={campaignId} />
			<section>
				<h3>Nodes</h3>
				{nodes?.map((node) => (
					<div key={node._id}>
						<h4>{node.name}</h4>
						<p>{node.content}</p>
					</div>
				))}
			</section>
		</div>
	);
}

function CreateNode({ campaignId }: { campaignId: Id<"campaigns"> }) {
	const createNodeMutation = useMutation({
		mutationFn: useConvexMutation(api.decisionNodes.createDecisionNode),
	});

	const handleCreateNode = async () => {
		const result = await createNodeMutation.mutateAsync({
			name: "New Node",
			content: "New Node Content",
			campaignId,
		});
	};

	return (
		<button type="button" onClick={handleCreateNode}>
			Create Node
		</button>
	);
}
