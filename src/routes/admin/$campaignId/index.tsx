import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/$campaignId/")({
	component: RouteComponent,
	// Could create a campaign here if it doesn't exist?
	// Might want to be more explicit about it though
});

function RouteComponent() {
	const { campaignId } = Route.useParams();

	return (
		<div className="flex flex-col gap-4 p-10">
			<h1 className="font-bold text-3xl">Campaign Page for {campaignId}</h1>
			<div>
				<ul className="flex gap-4">
					<li>
						<Link to="/">Decision Nodes</Link>
					</li>
					<li>
						<Link to="/">Plan</Link>
					</li>
					<li>
						<Link to="/">Chat</Link>
					</li>
				</ul>
			</div>
		</div>
	);
}
