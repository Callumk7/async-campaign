import { createFileRoute, type LinkProps } from "@tanstack/react-router";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Link } from "~/components/ui/link";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<main className="mx-auto flex max-w-4xl flex-col gap-6 p-8">
			<div>
				<p className="text-sm uppercase tracking-wide text-slate-500">
					Async Campaign
				</p>
				<h1 className="text-4xl font-bold text-slate-950">
					Function test scaffold
				</h1>
				<p className="mt-2 text-slate-600">
					Simple CRUD screens for exercising the Convex functions while the app
					shape is still forming.
				</p>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<LinkCard to="/campaigns" title="Campaigns">
					Create campaigns, then open one to manage characters, locations,
					factions, decision nodes, notes, and messages.
				</LinkCard>
				<LinkCard to="/users" title="Users">
					Create and edit the toy users used by notes, messages, and campaign
					ownership.
				</LinkCard>
			</div>
		</main>
	);
}

function LinkCard({
	to,
	title,
	children,
}: {
	to: LinkProps["to"];
	title: string;
	children: React.ReactNode;
}) {
	return (
		<Link to={to} className="hover:no-underline">
			<Card className="hover:border-blue-300">
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{children}</CardDescription>
				</CardHeader>
			</Card>
		</Link>
	);
}
