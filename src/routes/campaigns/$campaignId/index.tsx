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
import { Field, FieldError, Form, Label } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Link } from "~/components/ui/link";
import { Select } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/campaigns/$campaignId/")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			convexQuery(api.campaigns.getCampaignWithChildren, {
				id: params.campaignId as Id<"campaigns">,
			}),
		);
	},
});

type StatusMessage = { type: "success" | "error"; text: string } | null;

function RouteComponent() {
	const params = Route.useParams();
	const campaignId = params.campaignId as Id<"campaigns">;
	const queryClient = useQueryClient();
	const { selectedUserId } = useAuth();
	const campaignQuery = convexQuery(api.campaigns.getCampaignWithChildren, {
		id: campaignId,
	});
	const { data } = useSuspenseQuery(campaignQuery);
	const [status, setStatus] = React.useState<StatusMessage>(null);

	const updateCampaign = useMutation({
		mutationFn: useConvexMutation(api.campaigns.updateCampaign),
	});
	const deleteCharacter = useCrudMutation(api.characters.deleteCharacter);
	const deleteLocation = useCrudMutation(api.locations.deleteLocation);
	const deleteFaction = useCrudMutation(api.factions.deleteFaction);
	const deleteDecisionNode = useCrudMutation(
		api.decisionNodes.deleteDecisionNode,
	);
	const deleteNote = useCrudMutation(api.notes.deleteNote);
	const deleteMessage = useCrudMutation(api.messages.deleteMessage);
	const updateCharacter = useCrudMutation(api.characters.updateCharacter);
	const updateLocation = useCrudMutation(api.locations.updateLocation);
	const updateFaction = useCrudMutation(api.factions.updateFaction);
	const updateDecisionNode = useCrudMutation(
		api.decisionNodes.updateDecisionNode,
	);
	const updateNote = useCrudMutation(api.notes.updateNote);
	const updateMessage = useCrudMutation(api.messages.updateMessage);

	const refresh = React.useCallback(async () => {
		await queryClient.invalidateQueries({ queryKey: campaignQuery.queryKey });
	}, [queryClient, campaignQuery.queryKey]);

	const runCrud = React.useCallback(
		async (label: string, operation: () => Promise<unknown>) => {
			setStatus(null);
			try {
				await operation();
				await refresh();
				setStatus({ type: "success", text: `${label} complete.` });
			} catch (error) {
				setStatus({
					type: "error",
					text: error instanceof Error ? error.message : `${label} failed.`,
				});
			}
		},
		[refresh],
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

	const { campaign } = data;

	return (
		<Authenticated>
			<main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
				<div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
					<Link to="/campaigns">← Back to campaigns</Link>
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<p className="text-sm uppercase tracking-wide text-slate-500">
								Campaign workbench
							</p>
							<h1 className="text-3xl font-bold text-slate-950">
								{campaign.name}
							</h1>
							<p className="max-w-2xl text-slate-600">
								{campaign.description || "No description yet."}
							</p>
						</div>
						<span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
							{campaign.status ?? "active"}
						</span>
					</div>
				</div>

				{status ? (
					<p
						className={
							status.type === "success"
								? "rounded border border-green-200 bg-green-50 p-3 text-green-700"
								: "rounded border border-red-200 bg-red-50 p-3 text-red-700"
						}
					>
						{status.text}
					</p>
				) : null}

				<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
					<h2 className="mb-4 text-xl font-semibold">Edit campaign</h2>
					<CampaignForm
						initialName={campaign.name}
						initialDescription={campaign.description ?? ""}
						initialStatus={campaign.status ?? "active"}
						onSubmit={(values) =>
							runCrud("Campaign update", () =>
								updateCampaign.mutateAsync({ id: campaign._id, ...values }),
							)
						}
						isPending={updateCampaign.isPending}
					/>
				</section>

				<div className="grid gap-6 lg:grid-cols-2">
					<CharactersSection
						campaignId={campaignId}
						characters={data.characters}
						onDone={refresh}
						onDelete={(id) =>
							runCrud("Character delete", () =>
								deleteCharacter.mutateAsync({ id }),
							)
						}
						onQuickRename={(id, name) =>
							runCrud("Character rename", () =>
								updateCharacter.mutateAsync({ id, name }),
							)
						}
					/>
					<LocationsSection
						campaignId={campaignId}
						locations={data.locations}
						onDone={refresh}
						onDelete={(id) =>
							runCrud("Location delete", () =>
								deleteLocation.mutateAsync({ id }),
							)
						}
						onQuickRename={(id, name) =>
							runCrud("Location rename", () =>
								updateLocation.mutateAsync({ id, name }),
							)
						}
					/>
					<FactionsSection
						campaignId={campaignId}
						factions={data.factions}
						onDone={refresh}
						onDelete={(id) =>
							runCrud("Faction delete", () => deleteFaction.mutateAsync({ id }))
						}
						onQuickRename={(id, name) =>
							runCrud("Faction rename", () =>
								updateFaction.mutateAsync({ id, name }),
							)
						}
					/>
					<DecisionNodesSection
						campaignId={campaignId}
						decisionNodes={data.decisionNodes}
						onDone={refresh}
						onDelete={(id) =>
							runCrud("Decision node delete", () =>
								deleteDecisionNode.mutateAsync({ id }),
							)
						}
						onQuickRename={(id, name) =>
							runCrud("Decision node rename", () =>
								updateDecisionNode.mutateAsync({ id, name }),
							)
						}
					/>
					<NotesSection
						campaignId={campaignId}
						selectedUserId={selectedUserId}
						notes={data.notes}
						onDone={refresh}
						onDelete={(id) =>
							runCrud("Note delete", () => deleteNote.mutateAsync({ id }))
						}
						onQuickRename={(id, title) =>
							runCrud("Note retitle", () =>
								updateNote.mutateAsync({ id, title }),
							)
						}
					/>
					<MessagesSection
						campaignId={campaignId}
						selectedUserId={selectedUserId}
						messages={data.messages}
						onDone={refresh}
						onDelete={(id) =>
							runCrud("Message delete", () => deleteMessage.mutateAsync({ id }))
						}
						onQuickEdit={(id, body) =>
							runCrud("Message edit", () =>
								updateMessage.mutateAsync({ id, body }),
							)
						}
					/>
				</div>
			</main>
		</Authenticated>
	);
}

function useCrudMutation<T>(mutationReference: T) {
	return useMutation({
		mutationFn: useConvexMutation(mutationReference as never),
	});
}

function CampaignForm({
	initialName,
	initialDescription,
	initialStatus,
	onSubmit,
	isPending,
}: {
	initialName: string;
	initialDescription: string;
	initialStatus: "active" | "paused" | "archived";
	onSubmit: (values: {
		name: string;
		description?: string;
		status: "active" | "paused" | "archived";
	}) => Promise<unknown>;
	isPending: boolean;
}) {
	const [name, setName] = React.useState(initialName);
	const [description, setDescription] = React.useState(initialDescription);
	const [status, setStatus] = React.useState(initialStatus);
	return (
		<Form
			onSubmit={async (event) => {
				event.preventDefault();
				await onSubmit({
					name: name.trim(),
					description: emptyToUndefined(description),
					status,
				});
			}}
		>
			<div className="grid gap-4 md:grid-cols-3">
				<Field>
					<Label htmlFor="campaign-name">Name</Label>
					<Input
						id="campaign-name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						required
					/>
				</Field>
				<Field>
					<Label htmlFor="campaign-status">Status</Label>
					<Select
						id="campaign-status"
						value={status}
						onChange={(event) => setStatus(event.target.value as typeof status)}
					>
						<option value="active">Active</option>
						<option value="paused">Paused</option>
						<option value="archived">Archived</option>
					</Select>
				</Field>
				<div className="flex items-end">
					<Button type="submit" disabled={isPending}>
						{isPending ? "Saving..." : "Save campaign"}
					</Button>
				</div>
			</div>
			<Field>
				<Label htmlFor="campaign-description">Description</Label>
				<Textarea
					id="campaign-description"
					value={description}
					onChange={(event) => setDescription(event.target.value)}
				/>
			</Field>
		</Form>
	);
}

function SectionCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
			<h2 className="text-xl font-semibold text-slate-950">{title}</h2>
			{children}
		</section>
	);
}

function EmptyState({ children }: { children: React.ReactNode }) {
	return (
		<p className="rounded border border-dashed border-slate-300 p-3 text-sm text-slate-500">
			{children}
		</p>
	);
}

function ListRow({
	title,
	subtitle,
	onRename,
	onDelete,
}: {
	title: string;
	subtitle?: string;
	onRename: () => void;
	onDelete: () => void;
}) {
	return (
		<li className="flex items-start justify-between gap-3 rounded border border-slate-200 p-3">
			<div className="min-w-0">
				<p className="truncate font-medium text-slate-900">{title}</p>
				{subtitle ? (
					<p className="line-clamp-2 text-sm text-slate-500">{subtitle}</p>
				) : null}
			</div>
			<div className="flex shrink-0 gap-2">
				<button
					type="button"
					className="text-sm text-blue-600 hover:underline"
					onClick={onRename}
				>
					Edit
				</button>
				<button
					type="button"
					className="text-sm text-red-600 hover:underline"
					onClick={onDelete}
				>
					Delete
				</button>
			</div>
		</li>
	);
}

function CharactersSection({
	campaignId,
	characters,
	onDone,
	onDelete,
	onQuickRename,
}: {
	campaignId: Id<"campaigns">;
	characters: Array<{
		_id: Id<"characters">;
		name: string;
		description?: string;
		status?: string;
	}>;
	onDone: () => Promise<unknown>;
	onDelete: (id: Id<"characters">) => void;
	onQuickRename: (id: Id<"characters">, name: string) => void;
}) {
	const createCharacter = useCrudMutation(api.characters.createCharacter);
	const [name, setName] = React.useState("");
	const [description, setDescription] = React.useState("");
	return (
		<SectionCard title="Characters">
			<SimpleCreateForm
				name={name}
				description={description}
				namePlaceholder="Character name"
				descriptionPlaceholder="Description"
				isPending={createCharacter.isPending}
				onNameChange={setName}
				onDescriptionChange={setDescription}
				onSubmit={async () => {
					await createCharacter.mutateAsync({
						name: name.trim(),
						description: emptyToUndefined(description),
						campaignId,
					});
					setName("");
					setDescription("");
					await onDone();
				}}
			/>
			<CrudList
				items={characters}
				empty="No characters yet."
				onDelete={onDelete}
				onQuickRename={onQuickRename}
			/>
		</SectionCard>
	);
}

function LocationsSection({
	campaignId,
	locations,
	onDone,
	onDelete,
	onQuickRename,
}: {
	campaignId: Id<"campaigns">;
	locations: Array<{
		_id: Id<"locations">;
		name: string;
		description?: string;
	}>;
	onDone: () => Promise<unknown>;
	onDelete: (id: Id<"locations">) => void;
	onQuickRename: (id: Id<"locations">, name: string) => void;
}) {
	const createLocation = useCrudMutation(api.locations.createLocation);
	const [name, setName] = React.useState("");
	const [description, setDescription] = React.useState("");
	return (
		<SectionCard title="Locations">
			<SimpleCreateForm
				name={name}
				description={description}
				namePlaceholder="Location name"
				descriptionPlaceholder="Description"
				isPending={createLocation.isPending}
				onNameChange={setName}
				onDescriptionChange={setDescription}
				onSubmit={async () => {
					await createLocation.mutateAsync({
						name: name.trim(),
						description: emptyToUndefined(description),
						campaignId,
					});
					setName("");
					setDescription("");
					await onDone();
				}}
			/>
			<CrudList
				items={locations}
				empty="No locations yet."
				onDelete={onDelete}
				onQuickRename={onQuickRename}
			/>
		</SectionCard>
	);
}

function FactionsSection({
	campaignId,
	factions,
	onDone,
	onDelete,
	onQuickRename,
}: {
	campaignId: Id<"campaigns">;
	factions: Array<{ _id: Id<"factions">; name: string; description?: string }>;
	onDone: () => Promise<unknown>;
	onDelete: (id: Id<"factions">) => void;
	onQuickRename: (id: Id<"factions">, name: string) => void;
}) {
	const createFaction = useCrudMutation(api.factions.createFaction);
	const [name, setName] = React.useState("");
	const [description, setDescription] = React.useState("");
	return (
		<SectionCard title="Factions">
			<SimpleCreateForm
				name={name}
				description={description}
				namePlaceholder="Faction name"
				descriptionPlaceholder="Description"
				isPending={createFaction.isPending}
				onNameChange={setName}
				onDescriptionChange={setDescription}
				onSubmit={async () => {
					await createFaction.mutateAsync({
						name: name.trim(),
						description: emptyToUndefined(description),
						campaignId,
					});
					setName("");
					setDescription("");
					await onDone();
				}}
			/>
			<CrudList
				items={factions}
				empty="No factions yet."
				onDelete={onDelete}
				onQuickRename={onQuickRename}
			/>
		</SectionCard>
	);
}

function DecisionNodesSection({
	campaignId,
	decisionNodes,
	onDone,
	onDelete,
	onQuickRename,
}: {
	campaignId: Id<"campaigns">;
	decisionNodes: Array<{
		_id: Id<"decisionNodes">;
		name: string;
		content: string;
		status?: string;
	}>;
	onDone: () => Promise<unknown>;
	onDelete: (id: Id<"decisionNodes">) => void;
	onQuickRename: (id: Id<"decisionNodes">, name: string) => void;
}) {
	const createDecisionNode = useCrudMutation(
		api.decisionNodes.createDecisionNode,
	);
	const [name, setName] = React.useState("");
	const [content, setContent] = React.useState("");
	return (
		<SectionCard title="Decision nodes">
			<SimpleCreateForm
				name={name}
				description={content}
				namePlaceholder="Decision name"
				descriptionPlaceholder="Content"
				isPending={createDecisionNode.isPending}
				onNameChange={setName}
				onDescriptionChange={setContent}
				onSubmit={async () => {
					await createDecisionNode.mutateAsync({
						name: name.trim(),
						content: content.trim(),
						campaignId,
					});
					setName("");
					setContent("");
					await onDone();
				}}
			/>
			<CrudList
				items={decisionNodes.map((node) => ({
					...node,
					description: node.content,
				}))}
				empty="No decision nodes yet."
				onDelete={onDelete}
				onQuickRename={onQuickRename}
			/>
		</SectionCard>
	);
}

function NotesSection({
	campaignId,
	selectedUserId,
	notes,
	onDone,
	onDelete,
	onQuickRename,
}: {
	campaignId: Id<"campaigns">;
	selectedUserId: Id<"users"> | null;
	notes: Array<{
		_id: Id<"notes">;
		title: string;
		content: string;
		visibility?: string;
	}>;
	onDone: () => Promise<unknown>;
	onDelete: (id: Id<"notes">) => void;
	onQuickRename: (id: Id<"notes">, title: string) => void;
}) {
	const createNote = useCrudMutation(api.notes.createNote);
	const [title, setTitle] = React.useState("");
	const [content, setContent] = React.useState("");
	return (
		<SectionCard title="Notes">
			{selectedUserId ? null : (
				<FieldError>Select a user before creating notes.</FieldError>
			)}
			<SimpleCreateForm
				name={title}
				description={content}
				namePlaceholder="Note title"
				descriptionPlaceholder="Note content"
				isPending={createNote.isPending}
				disabled={!selectedUserId}
				onNameChange={setTitle}
				onDescriptionChange={setContent}
				onSubmit={async () => {
					if (!selectedUserId) return;
					await createNote.mutateAsync({
						title: title.trim(),
						content: content.trim(),
						authorId: selectedUserId,
						campaignId,
					});
					setTitle("");
					setContent("");
					await onDone();
				}}
			/>
			<CrudList
				items={notes.map((note) => ({
					...note,
					name: note.title,
					description: note.content,
				}))}
				empty="No notes yet."
				onDelete={onDelete}
				onQuickRename={onQuickRename}
			/>
		</SectionCard>
	);
}

function MessagesSection({
	campaignId,
	selectedUserId,
	messages,
	onDone,
	onDelete,
	onQuickEdit,
}: {
	campaignId: Id<"campaigns">;
	selectedUserId: Id<"users"> | null;
	messages: Array<{ _id: Id<"messages">; body: string; visibility?: string }>;
	onDone: () => Promise<unknown>;
	onDelete: (id: Id<"messages">) => void;
	onQuickEdit: (id: Id<"messages">, body: string) => void;
}) {
	const createMessage = useCrudMutation(api.messages.createMessage);
	const [body, setBody] = React.useState("");
	return (
		<SectionCard title="Messages">
			{selectedUserId ? null : (
				<FieldError>Select a user before creating messages.</FieldError>
			)}
			<Form
				onSubmit={async (event) => {
					event.preventDefault();
					if (!body.trim() || !selectedUserId) return;
					await createMessage.mutateAsync({
						body: body.trim(),
						userId: selectedUserId,
						campaignId,
					});
					setBody("");
					await onDone();
				}}
			>
				<Field>
					<Label htmlFor="message-body">Message</Label>
					<Textarea
						id="message-body"
						value={body}
						onChange={(event) => setBody(event.target.value)}
						disabled={!selectedUserId}
					/>
				</Field>
				<Button
					type="submit"
					disabled={createMessage.isPending || !selectedUserId}
				>
					{createMessage.isPending ? "Creating..." : "Create message"}
				</Button>
			</Form>
			{messages.length === 0 ? (
				<EmptyState>No messages yet.</EmptyState>
			) : (
				<ul className="flex flex-col gap-2">
					{messages.map((message) => (
						<ListRow
							key={message._id}
							title={message.body}
							onDelete={() => onDelete(message._id)}
							onRename={() => {
								const nextBody = window.prompt("Message body", message.body);
								if (nextBody?.trim()) onQuickEdit(message._id, nextBody.trim());
							}}
						/>
					))}
				</ul>
			)}
		</SectionCard>
	);
}

function SimpleCreateForm({
	name,
	description,
	namePlaceholder,
	descriptionPlaceholder,
	isPending,
	disabled = false,
	onNameChange,
	onDescriptionChange,
	onSubmit,
}: {
	name: string;
	description: string;
	namePlaceholder: string;
	descriptionPlaceholder: string;
	isPending: boolean;
	disabled?: boolean;
	onNameChange: (value: string) => void;
	onDescriptionChange: (value: string) => void;
	onSubmit: () => Promise<unknown>;
}) {
	return (
		<Form
			onSubmit={async (event) => {
				event.preventDefault();
				if (!name.trim() || disabled) return;
				await onSubmit();
			}}
		>
			<Field>
				<Label>Name / title</Label>
				<Input
					value={name}
					onChange={(event) => onNameChange(event.target.value)}
					placeholder={namePlaceholder}
					disabled={disabled}
					required
				/>
			</Field>
			<Field>
				<Label>Description / content</Label>
				<Textarea
					value={description}
					onChange={(event) => onDescriptionChange(event.target.value)}
					placeholder={descriptionPlaceholder}
					disabled={disabled}
				/>
			</Field>
			<Button type="submit" disabled={isPending || disabled}>
				{isPending ? "Creating..." : "Create"}
			</Button>
		</Form>
	);
}

function CrudList<
	T extends { _id: string; name: string; description?: string },
>({
	items,
	empty,
	onDelete,
	onQuickRename,
}: {
	items: T[];
	empty: string;
	onDelete: (id: T["_id"]) => void;
	onQuickRename: (id: T["_id"], name: string) => void;
}) {
	if (items.length === 0) return <EmptyState>{empty}</EmptyState>;
	return (
		<ul className="flex flex-col gap-2">
			{items.map((item) => (
				<ListRow
					key={item._id}
					title={item.name}
					subtitle={item.description}
					onDelete={() => onDelete(item._id)}
					onRename={() => {
						const nextName = window.prompt("New name/title", item.name);
						if (nextName?.trim()) onQuickRename(item._id, nextName.trim());
					}}
				/>
			))}
		</ul>
	);
}

function emptyToUndefined(value: string) {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}
