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
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

export const Route = createFileRoute(
	"/campaigns/$campaignId/admin/trees_/$treeId",
)({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			convexQuery(api.trees.getTreeWithNodesAndOptions, {
				id: params.treeId as Id<"decisionTrees">,
			}),
		);
	},
});

function RouteComponent() {
	const params = Route.useParams();
	const campaignId = params.campaignId as Id<"campaigns">;
	const treeId = params.treeId as Id<"decisionTrees">;
	const treeQuery = convexQuery(api.trees.getTreeWithNodesAndOptions, {
		id: treeId,
	});
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
					{data.nodes.length > 0 ? (
						<div className="flex flex-col gap-3">
							{data.nodes.map(({ node, options }) => (
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
									<div className="mt-3 flex flex-col gap-2 rounded-md border border-border/70 bg-background/60 p-3">
										<p className="text-sm font-medium">Options</p>
										{options.length > 0 ? (
											<ul className="flex flex-col gap-2 text-sm">
												{options.map(({ option, availabilities }) => (
													<li
														key={option._id}
														className="rounded-md border border-border/70 p-2"
													>
														<div className="font-medium">{option.label}</div>
														{option.description ? (
															<p className="text-muted-foreground">
																{option.description}
															</p>
														) : null}
														<p className="mt-1 text-xs text-muted-foreground">
															Available to{" "}
															{availabilities.length > 0
																? `${availabilities.length} character(s)`
																: "all characters"}
														</p>
													</li>
												))}
											</ul>
										) : (
											<p className="text-sm text-muted-foreground">
												No options yet.
											</p>
										)}
										<CreateOptionForm
											campaignId={campaignId}
											nodeId={node._id}
											characters={data.characters}
											queryKey={treeQuery.queryKey}
										/>
									</div>
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

function CreateOptionForm({
	campaignId,
	nodeId,
	characters,
	queryKey,
}: {
	campaignId: Id<"campaigns">;
	nodeId: Id<"decisionNodes">;
	characters: Doc<"characters">[];
	queryKey: readonly unknown[];
}) {
	const queryClient = useQueryClient();
	const [label, setLabel] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [selectedCharacterIds, setSelectedCharacterIds] = React.useState<
		Id<"characters">[]
	>([]);
	const createOption = useMutation({
		mutationFn: useConvexMutation(api.decisionOptions.createDecisionOption),
	});

	function toggleCharacter(characterId: Id<"characters">) {
		setSelectedCharacterIds((current) =>
			current.includes(characterId)
				? current.filter((id) => id !== characterId)
				: [...current, characterId],
		);
	}

	async function handleCreateOption(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmedLabel = label.trim();
		const trimmedDescription = description.trim();
		if (!trimmedLabel) return;

		await createOption.mutateAsync({
			decisionNodeId: nodeId,
			campaignId,
			label: trimmedLabel,
			description: trimmedDescription || undefined,
			status: "active",
			availableTo: selectedCharacterIds.map((characterId) => ({
				characterId,
				status: "available",
			})),
		});
		setLabel("");
		setDescription("");
		setSelectedCharacterIds([]);
		await queryClient.invalidateQueries({ queryKey });
	}

	return (
		<form
			onSubmit={handleCreateOption}
			className="mt-2 flex flex-col gap-3 border-t border-border/70 pt-3"
		>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor={`option-label-${nodeId}`}>New option</FieldLabel>
					<Input
						id={`option-label-${nodeId}`}
						value={label}
						onChange={(event) => setLabel(event.target.value)}
						placeholder="Negotiate with the guards"
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor={`option-description-${nodeId}`}>
						Description
					</FieldLabel>
					<Textarea
						id={`option-description-${nodeId}`}
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						placeholder="Optional player-facing detail or GM notes."
					/>
				</Field>
			</FieldGroup>
			<div className="flex flex-col gap-2">
				<p className="text-sm font-medium">Available to</p>
				{characters.length > 0 ? (
					<div className="grid gap-2 sm:grid-cols-2">
						{characters.map((character) => (
							<label
								key={character._id}
								className="flex items-center gap-2 text-sm"
							>
								<input
									type="checkbox"
									checked={selectedCharacterIds.includes(character._id)}
									onChange={() => toggleCharacter(character._id)}
									className="size-4 rounded border-border bg-background"
								/>
								<span>{character.name}</span>
							</label>
						))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						Create characters before restricting options to specific players.
					</p>
				)}
				<p className="text-xs text-muted-foreground">
					Leave all unchecked to make this option available to everyone.
				</p>
			</div>
			<Button
				type="submit"
				size="sm"
				disabled={createOption.isPending || !label.trim()}
			>
				{createOption.isPending ? "Adding…" : "Add option"}
			</Button>
		</form>
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
