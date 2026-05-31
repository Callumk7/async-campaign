import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useAuth } from "~/components/auth/auth-provider";
import { Authenticated } from "~/components/auth/autheticated";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Link } from "~/components/ui/link";
import { NativeSelect as Select } from "~/components/ui/native-select";
import { Textarea } from "~/components/ui/textarea";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

type CampaignRole = "admin" | "dm" | "player" | "observer";
type CampaignStatus = "active" | "paused" | "archived";

export const Route = createFileRoute("/campaigns/$campaignId/admin/")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(
				convexQuery(api.campaigns.getCampaignWithChildren, {
					id: params.campaignId as Id<"campaigns">,
				}),
			),
			context.queryClient.ensureQueryData(convexQuery(api.users.getUsers, {})),
		]);
	},
});

function RouteComponent() {
	const { campaignId: campaignIdParam } = Route.useParams();
	const campaignId = campaignIdParam as Id<"campaigns">;
	const queryClient = useQueryClient();
	const { selectedUser, selectedUserId } = useAuth();
	const campaignQuery = convexQuery(api.campaigns.getCampaignWithChildren, {
		id: campaignId,
	});
	const usersQuery = convexQuery(api.users.getUsers, {});
	const { data } = useSuspenseQuery(campaignQuery);
	const { data: users } = useSuspenseQuery(usersQuery);
	const updateCampaign = useMutation({
		mutationFn: useConvexMutation(api.campaigns.updateCampaign),
	});
	const addUser = useMutation({
		mutationFn: useConvexMutation(api.campaignMembers.addUserToCampaign),
	});
	const updateMember = useMutation({
		mutationFn: useConvexMutation(api.campaignMembers.updateCampaignMember),
	});
	const deleteMember = useMutation({
		mutationFn: useConvexMutation(api.campaignMembers.deleteCampaignMember),
	});
	const [name, setName] = React.useState(data?.campaign.name ?? "");
	const [description, setDescription] = React.useState(
		data?.campaign.description ?? "",
	);
	const [status, setStatus] = React.useState<CampaignStatus>(
		data?.campaign.status ?? "active",
	);
	const [userIdToAdd, setUserIdToAdd] = React.useState<Id<"users"> | "">("");
	const [roleToAdd, setRoleToAdd] = React.useState<CampaignRole>("player");
	const [message, setMessage] = React.useState<string | null>(null);
	const [error, setError] = React.useState<string | null>(null);

	const currentMembership = data?.membersWithUsers.find(
		(row) => row.membership.userId === selectedUserId,
	);
	const canManage =
		selectedUser?.role === "admin" ||
		data?.campaign.ownerId === selectedUserId ||
		currentMembership?.membership.role === "admin" ||
		currentMembership?.membership.role === "dm";

	const refresh = React.useCallback(async () => {
		await queryClient.invalidateQueries({ queryKey: campaignQuery.queryKey });
	}, [queryClient, campaignQuery.queryKey]);

	const memberUserIds = new Set(
		data?.membersWithUsers.map((row) => row.membership.userId),
	);
	const usersAvailableToAdd = users.filter(
		(user) => !memberUserIds.has(user._id),
	);

	async function run(label: string, operation: () => Promise<unknown>) {
		setMessage(null);
		setError(null);
		try {
			await operation();
			await refresh();
			setMessage(`${label} saved.`);
		} catch (caughtError) {
			setError(
				caughtError instanceof Error ? caughtError.message : `${label} failed.`,
			);
		}
	}

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

	if (!canManage) {
		return (
			<Authenticated>
				<main className="mx-auto max-w-3xl p-8">
					<Link to="/campaigns/$campaignId" params={{ campaignId }}>
						← Back to campaign
					</Link>
					<div className="mt-6 rounded-xl border p-5">
						You must be a campaign admin or DM to manage this campaign.
					</div>
				</main>
			</Authenticated>
		);
	}

	return (
		<Authenticated>
			<main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
				<div>
					<Link to="/campaigns/$campaignId" params={{ campaignId }}>
						← Back to campaign
					</Link>
					<Link to="/campaigns/$campaignId/admin/nodes" params={{ campaignId }}>
						Nodes
					</Link>
					<p className="mt-4 text-sm uppercase tracking-wide">Admin</p>
					<h1 className="text-3xl font-bold">Manage {data.campaign.name}</h1>
					<p className="">Edit campaign details and add users to the roster.</p>
				</div>

				{message ? <p className="rounded border p-3">{message}</p> : null}
				{error ? (
					<FieldError className="rounded border p-3">{error}</FieldError>
				) : null}

				<Card>
					<CardHeader>
						<CardTitle>Campaign details</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={async (event) => {
								event.preventDefault();
								await run("Campaign", () =>
									updateCampaign.mutateAsync({
										id: campaignId,
										name: name.trim(),
										description: emptyToUndefined(description),
										status,
									}),
								);
							}}
							className="flex flex-col gap-4"
						>
							<FieldGroup className="grid gap-4 md:grid-cols-3">
								<Field>
									<FieldLabel htmlFor="campaign-name">Name</FieldLabel>
									<Input
										id="campaign-name"
										value={name}
										onChange={(event) => setName(event.target.value)}
										required
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor="campaign-status">Status</FieldLabel>
									<Select
										id="campaign-status"
										value={status}
										onChange={(event) =>
											setStatus(event.target.value as CampaignStatus)
										}
									>
										<option value="active">Active</option>
										<option value="paused">Paused</option>
										<option value="archived">Archived</option>
									</Select>
								</Field>
								<div className="flex items-end">
									<Button type="submit" disabled={updateCampaign.isPending}>
										{updateCampaign.isPending ? "Saving..." : "Save campaign"}
									</Button>
								</div>
							</FieldGroup>
							<Field>
								<FieldLabel htmlFor="campaign-description">
									Description
								</FieldLabel>
								<Textarea
									id="campaign-description"
									value={description}
									onChange={(event) => setDescription(event.target.value)}
								/>
							</Field>
						</form>
					</CardContent>
				</Card>

				<section className="rounded-xl border p-5 shadow-sm">
					<h2 className="mb-4 text-xl font-semibold">Add user</h2>
					{usersAvailableToAdd.length === 0 ? (
						<p className="text-sm">
							Every user has already been added to this campaign.
						</p>
					) : (
						<form
							onSubmit={async (event) => {
								event.preventDefault();
								if (!userIdToAdd || !selectedUserId) return;
								await run("User", async () => {
									await addUser.mutateAsync({
										campaignId,
										userId: userIdToAdd,
										role: roleToAdd,
										addedByUserId: selectedUserId,
									});
									setUserIdToAdd("");
									setRoleToAdd("player");
								});
							}}
						>
							<FieldGroup className="grid gap-4 md:grid-cols-[1fr_12rem_auto]">
								<Field>
									<FieldLabel htmlFor="user-to-add">User</FieldLabel>
									<Select
										id="user-to-add"
										value={userIdToAdd}
										onChange={(event) =>
											setUserIdToAdd(event.target.value as Id<"users">)
										}
										required
									>
										<option value="">Choose a user</option>
										{usersAvailableToAdd.map((user) => (
											<option key={user._id} value={user._id}>
												{user.name} ({user.role})
											</option>
										))}
									</Select>
								</Field>
								<Field>
									<FieldLabel htmlFor="role-to-add">Campaign role</FieldLabel>
									<Select
										id="role-to-add"
										value={roleToAdd}
										onChange={(event) =>
											setRoleToAdd(event.target.value as CampaignRole)
										}
									>
										<option value="player">Player</option>
										<option value="observer">Observer</option>
										<option value="dm">DM</option>
										<option value="admin">Admin</option>
									</Select>
								</Field>
								<div className="flex items-end">
									<Button
										type="submit"
										disabled={addUser.isPending || !userIdToAdd}
									>
										{addUser.isPending ? "Adding..." : "Add user"}
									</Button>
								</div>
							</FieldGroup>
						</form>
					)}
				</section>

				<section className="rounded-xl border p-5 shadow-sm">
					<h2 className="mb-4 text-xl font-semibold">Campaign members</h2>
					<ul className="flex flex-col gap-3">
						{data.membersWithUsers.map((row) => (
							<li
								key={row.membership._id}
								className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"
							>
								<div>
									<p className="font-medium">
										{row.user?.name ?? "Deleted user"}
									</p>
									<p className="text-sm">
										{row.user?.email ?? "No email"} · active character:{""}
										{row.activeCharacter?.name ?? "none"}
									</p>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<Select
										aria-label={`Role for ${row.user?.name ?? "member"}`}
										value={row.membership.role}
										onChange={(event) =>
											void run("Member role", () =>
												updateMember.mutateAsync({
													id: row.membership._id,
													role: event.target.value as CampaignRole,
												}),
											)
										}
									>
										<option value="player">Player</option>
										<option value="observer">Observer</option>
										<option value="dm">DM</option>
										<option value="admin">Admin</option>
									</Select>
									<Button
										type="button"
										variant="destructive"
										onClick={() => {
											if (row.membership.userId === data.campaign.ownerId)
												return;
											if (
												!window.confirm(
													`Remove ${row.user?.name ?? "this user"} from this campaign?`,
												)
											)
												return;
											void run("Member removal", () =>
												deleteMember.mutateAsync({ id: row.membership._id }),
											);
										}}
										disabled={row.membership.userId === data.campaign.ownerId}
									>
										Remove
									</Button>
								</div>
							</li>
						))}
					</ul>
				</section>
			</main>
		</Authenticated>
	);
}

function emptyToUndefined(value: string) {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}
