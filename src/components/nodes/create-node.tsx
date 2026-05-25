import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import * as React from "react";
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
			<form onSubmit={handleCreateNode}>
				<label>
					Name:
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</label>
				<label>
					Content:
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
					/>
				</label>
				<button type="submit">Create Node</button>
			</form>
		</div>
	);
}
