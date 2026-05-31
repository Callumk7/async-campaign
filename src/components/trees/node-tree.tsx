import { Input } from "@base-ui/react";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface NodeTreeProps {
	treeId: Id<"decisionTrees">;
}

export function NodeTree({ treeId }: NodeTreeProps) {
	const { data } = useQuery(
		convexQuery(api.trees.getTreeWithChildren, { id: treeId }),
	);
	return (
		<Card>
			<CardHeader>
				<CardTitle>{data?.tree.name}</CardTitle>
			</CardHeader>
			<CardContent>
				{data?.children.map((node) => (
					<div key={node._id}>{node.name}</div>
				))}
				<Separator />
				<form>
					<Input placeholder="New node" />
				</form>
			</CardContent>
		</Card>
	);
}
