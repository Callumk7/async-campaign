import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/admin/")({
	component: RouteComponent,
});

function RouteComponent() {
	const campaigns = useQuery(convexQuery(api.campaigns.getCampaigns));
	const [name, setName] = React.useState("");
	const [description, setDescription] = React.useState("");

	const createCampaign = useMutation({
		mutationFn: useConvexMutation(api.campaigns.createCampaign),
	});

	const handleCreateCampaign = async (
		e: React.ChangeEvent<HTMLFormElement>,
	) => {
		e.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) return;
		await createCampaign.mutateAsync({
			name: trimmedName,
			description,
		});
		setName("");
		setDescription("");
	};

	return (
		<div>
			<h1>Admin</h1>
			<ul>
				{campaigns.data?.map((campaign) => (
					<li key={campaign._id}>
						<Link
							params={{ campaignId: campaign._id }}
							to="/admin/$campaignId/nodes"
						>
							{campaign.name}
						</Link>
					</li>
				))}
			</ul>
			<form onSubmit={handleCreateCampaign}>
				<label>
					Name:
					<input
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</label>
				<label>
					Description:
					<input
						type="text"
						value={description}
						onChange={(event) => setDescription(event.target.value)}
					/>
				</label>
				<button type="submit">Create Campaign</button>
			</form>
		</div>
	);
}
