import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
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

	const handleCreateNode = async (
		event: React.SubmitEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		await createNodeMutation.mutateAsync({
			name,
			content,
			campaignId,
		});
	};

	return (
		<div>
			<form onSubmit={handleCreateNode} className="flex flex-col gap-4">
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="node-name">Name</FieldLabel>
						<Input
							id="node-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor="node-content">Content</FieldLabel>
						<Textarea
							id="node-content"
							value={content}
							onChange={(event) => setContent(event.target.value)}
						/>
					</Field>
				</FieldGroup>
				<Button type="submit">Create Node</Button>
			</form>
		</div>
	);
}
