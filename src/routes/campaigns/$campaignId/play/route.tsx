import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated } from "~/components/auth/autheticated";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "~/components/ui/empty";
import { Link } from "~/components/ui/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/campaigns/$campaignId/play")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const campaignId = params.campaignId as Id<"campaigns">;
		await Promise.all([
			context.queryClient.ensureQueryData(
				convexQuery(api.campaigns.getCampaignWithChildren, { id: campaignId }),
			),
			context.queryClient.ensureQueryData(
				convexQuery(api.trees.getTrees, { campaignId }),
			),
		]);
	},
});

function RouteComponent() {
	const campaignId = Route.useParams().campaignId as Id<"campaigns">;
	const { data } = useSuspenseQuery(
		convexQuery(api.campaigns.getCampaignWithChildren, { id: campaignId }),
	);
	const { data: trees } = useSuspenseQuery(
		convexQuery(api.trees.getTrees, { campaignId }),
	);

	if (!data) {
		return (
			<Authenticated>
				<main className="mx-auto max-w-3xl p-8">
					<Link to="/campaigns">← Back to campaigns</Link>
					<h1 className="mt-4 text-3xl font-bold">Campaign not found</h1>
				</main>
			</Authenticated>
		);
	}

	const nodesByTree = new Map<Id<"decisionTrees">, Doc<"decisionNodes">[]>();
	for (const tree of trees) {
		nodesByTree.set(tree._id, []);
	}
	const looseNodes: Doc<"decisionNodes">[] = [];
	for (const node of data.decisionNodes) {
		if (node.decisionTreeId && nodesByTree.has(node.decisionTreeId)) {
			nodesByTree.get(node.decisionTreeId)?.push(node);
		} else {
			looseNodes.push(node);
		}
	}

	return (
		<Authenticated>
			<main className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
				<header className="flex flex-wrap items-start justify-between gap-4">
					<div className="space-y-2">
						<Link to="/campaigns/$campaignId" params={{ campaignId }}>
							← Back to campaign
						</Link>
						<div>
							<div className="flex flex-wrap items-center gap-3">
								<h1 className="text-3xl font-bold">
									Play {data.campaign.name}
								</h1>
								<Badge variant="secondary">
									{data.campaign.status ?? "active"}
								</Badge>
							</div>
							<p className="mt-2 max-w-3xl text-muted-foreground">
								{data.campaign.description ||
									"A player-facing view for exploring live decision trees and resolving scenes."}
							</p>
						</div>
					</div>
				</header>

				{trees.length === 0 && looseNodes.length === 0 ? (
					<Empty className="min-h-80 border">
						<EmptyHeader>
							<EmptyTitle>No playable decision trees yet</EmptyTitle>
							<EmptyDescription>
								Once a DM creates trees and nodes, players will use this page to
								read the current scene, review available choices, and submit
								their intent.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Link
								variant="outline"
								to="/campaigns/$campaignId/admin/trees"
								params={{ campaignId }}
							>
								Manage trees
							</Link>
						</EmptyContent>
					</Empty>
				) : (
					<Tabs defaultValue={trees[0]?._id ?? "loose"} className="gap-4">
						<TabsList className="h-auto flex-wrap justify-start">
							{trees.map((tree) => (
								<TabsTrigger key={tree._id} value={tree._id}>
									{tree.name}
								</TabsTrigger>
							))}
							{looseNodes.length > 0 ? (
								<TabsTrigger value="loose">Loose nodes</TabsTrigger>
							) : null}
						</TabsList>

						{trees.map((tree) => (
							<TabsContent key={tree._id} value={tree._id}>
								<PlayTreePanel
									campaign={data.campaign}
									nodes={sortNodes(nodesByTree.get(tree._id) ?? [])}
									title={tree.name}
									description={tree.description}
								/>
							</TabsContent>
						))}

						{looseNodes.length > 0 ? (
							<TabsContent value="loose">
								<PlayTreePanel
									campaign={data.campaign}
									nodes={sortNodes(looseNodes)}
									title="Loose nodes"
									description="Nodes that are not assigned to a decision tree yet."
								/>
							</TabsContent>
						) : null}
					</Tabs>
				)}
			</main>
		</Authenticated>
	);
}

function PlayTreePanel({
	campaign,
	description,
	nodes,
	title,
}: {
	campaign: Doc<"campaigns">;
	description?: string;
	nodes: Doc<"decisionNodes">[];
	title: string;
}) {
	const currentNode =
		nodes.find((node) => node._id === campaign.currentDecisionNodeId) ??
		nodes.find((node) => node.status === "active") ??
		nodes.find((node) => !node.parentDecisionNodeId) ??
		nodes[0];
	const childNodes = currentNode
		? nodes.filter((node) => node.parentDecisionNodeId === currentNode._id)
		: [];

	return (
		<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
			<section className="flex flex-col gap-4">
				<Card>
					<CardHeader>
						<CardTitle>{title}</CardTitle>
						<CardDescription>
							{description ||
								"Review the live scene and choose how to proceed."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{currentNode ? (
							<div className="space-y-4">
								<div className="flex flex-wrap items-center gap-2">
									<Badge>{currentNode.status ?? "draft"}</Badge>
									<span className="text-sm text-muted-foreground">
										Current playable node
									</span>
								</div>
								<div>
									<h2 className="text-2xl font-semibold">{currentNode.name}</h2>
									<p className="mt-3 whitespace-pre-wrap text-base leading-7">
										{currentNode.content}
									</p>
								</div>
							</div>
						) : (
							<Empty className="border">
								<EmptyHeader>
									<EmptyTitle>No nodes in this tree</EmptyTitle>
									<EmptyDescription>
										Add a root node to make this tree playable.
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Available choices</CardTitle>
						<CardDescription>
							Placeholder actions for player decisions during play.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3">
						{childNodes.length > 0 ? (
							childNodes.map((node) => (
								<div key={node._id} className="rounded-lg border p-4">
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div>
											<h3 className="font-medium">{node.name}</h3>
											<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
												{node.content}
											</p>
										</div>
										<Badge variant="outline">{node.status ?? "draft"}</Badge>
									</div>
									<Button
										className="mt-4"
										disabled
										type="button"
										variant="secondary"
									>
										Choose this path
									</Button>
								</div>
							))
						) : (
							<p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
								No child choices yet. This could become a freeform response,
								resolution state, or DM handoff.
							</p>
						)}
					</CardContent>
				</Card>
			</section>

			<aside className="flex flex-col gap-4">
				<Card>
					<CardHeader>
						<CardTitle>Player intent</CardTitle>
						<CardDescription>
							Draft what your character does before submitting to the DM.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-3">
						<Textarea
							placeholder="I want to inspect the sigil, ask the guard about the locked gate, and..."
							rows={6}
						/>
						<div className="grid grid-cols-2 gap-2">
							<Button disabled type="button">
								Submit intent
							</Button>
							<Button disabled type="button" variant="outline">
								Ask question
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Tree outline</CardTitle>
						<CardDescription>{nodes.length} nodes loaded</CardDescription>
					</CardHeader>
					<CardContent>
						<ol className="space-y-2 text-sm">
							{nodes.map((node) => (
								<li
									key={node._id}
									className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
								>
									<span>{node.name}</span>
									<Badge variant="outline">{node.status ?? "draft"}</Badge>
								</li>
							))}
						</ol>
					</CardContent>
				</Card>
			</aside>
		</div>
	);
}

function sortNodes(nodes: Doc<"decisionNodes">[]) {
	return [...nodes].sort((first, second) => {
		const firstOrder = first.order ?? Number.MAX_SAFE_INTEGER;
		const secondOrder = second.order ?? Number.MAX_SAFE_INTEGER;
		if (firstOrder !== secondOrder) return firstOrder - secondOrder;
		return first._creationTime - second._creationTime;
	});
}
