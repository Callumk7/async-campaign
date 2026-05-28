import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { Button } from "#/components/ui/button";
import { Field, Form, Label } from "#/components/ui/form";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface CreateNodeProps {
	campaignId: Id<"campaigns">;
}

export function CreateNode({ campaignId }: CreateNodeProps) {
	const [name, setName] = React.useState("");
	const [content, setContent] = React.useState("");

	const createNodeMutation = useMutation({
		mutationFn: useConvexMutation(api.decisionNodes.createDecisionNode),
	});

	const handleCreateNode = async (e: React.ChangeEvent<HTMLFormElement>) => {
		e.preventDefault();
		await createNodeMutation.mutateAsync({
			name,
			content,
			campaignId,
		});
	};

	return (
		<div>
			<Form onSubmit={handleCreateNode}>
				<Field>
					<Label htmlFor="node-name">Name</Label>
					<Input
						id="node-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</Field>
				<Field>
					<Label htmlFor="node-content">Content</Label>
					<Textarea
						id="node-content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
					/>
				</Field>
				<Button type="submit">Create Node</Button>
			</Form>
		</div>
	);
}
