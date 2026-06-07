import { createFileRoute } from "@tanstack/react-router";
import { CreateQuestForm } from "~/components/quests/create-quest-form";
import type { Id } from "../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/admin/$campaignId/quests")({
	component: RouteComponent,
});

function RouteComponent() {
	const campaignId = Route.useParams().campaignId as Id<"campaigns">;
	return (
		<div>
			<h1>Quests</h1>
			<CreateQuestForm campaignId={campaignId} />
		</div>
	);
}
