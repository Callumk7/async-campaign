import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useAuth } from "~/components/auth/auth-provider";
import { Authenticated } from "~/components/auth/autheticated";
import { Button } from "~/components/ui/button";
import { Field, FieldError, Form, Label } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Link } from "~/components/ui/link";
import { Select } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/campaigns/new")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { selectedUserId } = useAuth();
	const createCampaign = useMutation({
		mutationFn: useConvexMutation(api.campaigns.createCampaign),
	});
	const [name, setName] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [coverImageUrl, setCoverImageUrl] = React.useState("");
	const [status, setStatus] = React.useState<"active" | "paused" | "archived">(
		"active",
	);
	const [error, setError] = React.useState<string | null>(null);

	return (
		<Authenticated>
			<main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
				<div className="flex flex-col gap-2">
					<Link to="/campaigns">← Back to campaigns</Link>
					<h1 className="text-3xl font-bold">Create a campaign</h1>
					<p className="text-sm text-neutral-600">
						Start a new campaign. You will be set as the owner for this toy app.
					</p>
				</div>

				<Form
					className="rounded border p-4"
					onSubmit={async (event) => {
						event.preventDefault();
						setError(null);

						const trimmedName = name.trim();
						const trimmedDescription = description.trim();
						const trimmedCoverImageUrl = coverImageUrl.trim();

						if (!trimmedName) {
							setError("Campaign name is required.");
							return;
						}

						try {
							const campaignId = await createCampaign.mutateAsync({
								name: trimmedName,
								description: trimmedDescription || undefined,
								ownerId: selectedUserId ?? undefined,
								status,
								coverImageUrl: trimmedCoverImageUrl || undefined,
							});

							void navigate({
								to: "/campaigns/$campaignId",
								params: { campaignId },
							});
						} catch (caughtError) {
							setError(
								caughtError instanceof Error
									? caughtError.message
									: "Failed to create campaign.",
							);
						}
					}}
				>
					<Field>
						<Label htmlFor="campaign-name">Name</Label>
						<Input
							id="campaign-name"
							placeholder="The Shattered Isles"
							value={name}
							onChange={(event) => setName(event.target.value)}
							required
						/>
					</Field>

					<Field>
						<Label htmlFor="campaign-description">Description</Label>
						<Textarea
							id="campaign-description"
							placeholder="What is this campaign about?"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							rows={5}
						/>
					</Field>

					<Field>
						<Label htmlFor="campaign-cover-image-url">Cover image URL</Label>
						<Input
							id="campaign-cover-image-url"
							placeholder="https://example.com/image.jpg"
							value={coverImageUrl}
							onChange={(event) => setCoverImageUrl(event.target.value)}
						/>
					</Field>

					<Field>
						<Label htmlFor="campaign-status">Status</Label>
						<Select
							id="campaign-status"
							value={status}
							onChange={(event) =>
								setStatus(
									event.target.value as "active" | "paused" | "archived",
								)
							}
						>
							<option value="active">Active</option>
							<option value="paused">Paused</option>
							<option value="archived">Archived</option>
						</Select>
					</Field>

					{error ? <FieldError>{error}</FieldError> : null}

					<div className="flex gap-2">
						<Button type="submit" disabled={createCampaign.isPending}>
							{createCampaign.isPending ? "Creating..." : "Create campaign"}
						</Button>
						<Link to="/campaigns">Cancel</Link>
					</div>
				</Form>
			</main>
		</Authenticated>
	);
}
