import type * as React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

export type PostFormProps = {
	body: string;
	canSubmit: boolean;
	error: unknown;
	isError: boolean;
	isPending: boolean;
	onBodyChange: (body: string) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	onTitleChange: (title: string) => void;
	selectedUserIdPresent: boolean;
	selectedUserName?: string;
	title: string;
};

export function PostForm({
	body,
	canSubmit,
	error,
	isError,
	isPending,
	onBodyChange,
	onSubmit,
	onTitleChange,
	selectedUserIdPresent,
	selectedUserName,
	title,
}: PostFormProps) {
	return (
		<form className="space-y-3 rounded-lg border p-4" onSubmit={onSubmit}>
			<div>
				<h4 className="font-medium">Create a new post</h4>
				<p className="text-muted-foreground text-xs">
					{selectedUserName
						? `Posting as ${selectedUserName}`
						: "Select a user before posting."}
				</p>
			</div>
			<Input
				aria-label="Post title"
				disabled={!selectedUserIdPresent || isPending}
				onChange={(event) => onTitleChange(event.target.value)}
				placeholder="Post title"
				value={title}
			/>
			<Textarea
				aria-label="Post body"
				className="min-h-24"
				disabled={!selectedUserIdPresent || isPending}
				onChange={(event) => onBodyChange(event.target.value)}
				placeholder="Start the discussion…"
				value={body}
			/>
			<Button disabled={!canSubmit || isPending} type="submit">
				{isPending ? "Posting…" : "Create post"}
			</Button>
			{isError ? <ErrorText error={error} /> : null}
		</form>
	);
}

export type ErrorTextProps = {
	error: unknown;
};

export function ErrorText({ error }: ErrorTextProps) {
	return (
		<p className="text-destructive text-sm">
			{error instanceof Error ? error.message : "Something went wrong."}
		</p>
	);
}
