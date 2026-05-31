import { createFileRoute } from "@tanstack/react-router";
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Link } from "~/components/ui/link";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<main className="mx-auto flex max-w-4xl flex-col gap-6 p-8">
			<div>
				<p className="text-sm uppercase tracking-wide">Async Campaign</p>
				<h1 className="text-4xl font-bold">Function test scaffold</h1>
				<p className="mt-2">
					Simple CRUD screens for exercising the Convex functions while the app
					shape is still forming.
				</p>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Campaigns</CardTitle>
					</CardHeader>
					<CardFooter>
						<Link to="/campaigns">Create campaigns</Link>
					</CardFooter>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Users</CardTitle>
					</CardHeader>
					<CardFooter>
						<Link to="/users">Create Users</Link>
					</CardFooter>
				</Card>
			</div>
		</main>
	);
}
