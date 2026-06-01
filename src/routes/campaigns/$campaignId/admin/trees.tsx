import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { Field, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Link } from "~/components/ui/link";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/campaigns/$campaignId/admin/trees")({
	component: RouteComponent,
});

function RouteComponent() {
	const campaignId = Route.useParams().campaignId as Id<"campaigns">;

	const { data: trees } = useQuery(
		convexQuery(api.trees.getTrees, { campaignId }),
	);
	return (
		<div>
			<h1>Decision Node Management</h1>
			<div>
				{trees?.map((tree) => (
					<div key={tree._id}>
						<Link
							to="/campaigns/$campaignId/admin/trees/$treeId"
							params={{ treeId: tree._id, campaignId }}
						>
							{tree.name}
						</Link>
					</div>
				))}
			</div>
			<CreateTreeForm campaignId={campaignId} />
		</div>
	);
}

function CreateTreeForm({ campaignId }: { campaignId: Id<"campaigns"> }) {
	const [name, setName] = React.useState("");
	const createTree = useMutation({
		mutationFn: useConvexMutation(api.trees.createTree),
	});

	const handleCreateTree = async (e: React.ChangeEvent<HTMLFormElement>) => {
		e.preventDefault();
		await createTree.mutateAsync({
			name,
			campaignId,
		});
	};

	return (
		<form onSubmit={handleCreateTree}>
			<Field>
				<FieldLabel>Name</FieldLabel>
				<Input value={name} onChange={(e) => setName(e.target.value)} />
			</Field>
			<Button type="submit">Create</Button>
		</form>
	);
}
