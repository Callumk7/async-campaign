import { createFileRoute } from "@tanstack/react-router";
import { Link } from "#/components/ui/link";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div className="p-8">
			<div className="flex gap-4 bg-amber-600">
				<Link to="/login">Login</Link>
			</div>
			<h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
			<p className="mt-4 text-lg">
				Edit <code>src/routes/index.tsx</code> to get started.
			</p>
		</div>
	);
}
