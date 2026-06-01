import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Link } from "~/components/ui/link";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
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
	const params = Route.useParams();
	const campaignId = params.campaignId as Id<"campaigns">;
	const treeId = params.treeId as Id<"decisionTrees">;
	const treeQuery = convexQuery(api.trees.getTreeWithChildren, { id: treeId });
	const { data } = useSuspenseQuery(treeQuery);

	if (!data) {
		return (
			<main className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
				<p className="text-sm text-muted-foreground">Tree not found.</p>
			</main>
		);
	}

	return (
		<main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
			<div className="flex flex-col gap-2">
				<Link
					to="/campaigns/$campaignId/admin/trees"
					params={{ campaignId }}
					className="text-sm text-muted-foreground hover:text-foreground"
				>
					← Back to trees
				</Link>
				<h1 className="text-3xl font-bold">{data.tree.name}</h1>
				{data.tree.description ? (
					<p className="text-muted-foreground">{data.tree.description}</p>
				) : null}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Child nodes</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{data.children.length > 0 ? (
						<div className="flex flex-col gap-2">
							{data.children.map((node) => (
								<div
									key={node._id}
									className="rounded-lg border border-border bg-muted/30 p-3"
								>
									<Link
										to="/campaigns/$campaignId/admin/nodes/$nodeId"
										params={{ campaignId, nodeId: node._id }}
										className="font-medium"
									>
										{node.name}
									</Link>
									{node.content ? (
										<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
											{node.content}
										</p>
									) : null}
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							This tree does not have any child nodes yet.
						</p>
					)}
					<Separator />
					<CreateChildNodeForm
						campaignId={campaignId}
						treeId={treeId}
						queryKey={treeQuery.queryKey}
					/>
				</CardContent>
			</Card>
		</main>
	);
}

function CreateChildNodeForm({
	campaignId,
	treeId,
	queryKey,
}: {
	campaignId: Id<"campaigns">;
	treeId: Id<"decisionTrees">;
	queryKey: readonly unknown[];
}) {
	const queryClient = useQueryClient();
	const [name, setName] = React.useState("");
	const [content, setContent] = React.useState("");
	const createNode = useMutation({
		mutationFn: useConvexMutation(api.decisionNodes.createDecisionNode),
	});

	async function handleCreateNode(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmedName = name.trim();
		const trimmedContent = content.trim();
		if (!trimmedName) return;

		await createNode.mutateAsync({
			name: trimmedName,
			content: trimmedContent,
			campaignId,
			decisionTreeId: treeId,
			status: "draft",
		});
		setName("");
		setContent("");
		await queryClient.invalidateQueries({ queryKey });
	}

	return (
		<form onSubmit={handleCreateNode} className="flex flex-col gap-4">
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="child-node-name">Name</FieldLabel>
					<Input
						id="child-node-name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="A branching choice, scene, or outcome"
						required
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="child-node-content">Content</FieldLabel>
					<Textarea
						id="child-node-content"
						value={content}
						onChange={(event) => setContent(event.target.value)}
						placeholder="Describe what happens at this node."
					/>
				</Field>
			</FieldGroup>
			<Button type="submit" disabled={createNode.isPending || !name.trim()}>
				{createNode.isPending ? "Creating…" : "Create child node"}
			</Button>
		</form>
	);
}
