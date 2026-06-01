import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<main className="mx-auto flex max-w-4xl flex-col gap-6 p-8">
			<div>
				<p className="text-sm uppercase tracking-wide">Async Campaign</p>
				<h1 className="text-4xl font-bold">Function test scaffold</h1>
				<p className="mt-2">
					Index page is under contruction. Please check back later.
				</p>
			</div>
		</main>
	);
}
