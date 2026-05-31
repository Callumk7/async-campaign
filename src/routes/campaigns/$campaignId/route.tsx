import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "~/components/auth/auth-provider";
import { Link } from "~/components/ui/link";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/campaigns/$campaignId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { campaignId: campaignIdParam } = Route.useParams();
	const campaignId = campaignIdParam as Id<"campaigns">;
	const { selectedCharacter, selectedUserId } = useAuth();
	const { data: membership } = useQuery(
		convexQuery(
			api.campaignMembers.getCampaignMemberByCampaignAndUser,
			selectedUserId ? { campaignId, userId: selectedUserId } : "skip",
		),
	);
	const currentCharacter =
		selectedCharacter?.campaignId === campaignId ? selectedCharacter : null;

	return (
		<div>
			<nav className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3 text-sm">
				<div className="flex flex-wrap items-center gap-4">
					<Link to="/campaigns/$campaignId" params={{ campaignId }}>
						Overview
					</Link>
					<Link to="/campaigns/$campaignId/login" params={{ campaignId }}>
						Choose character
					</Link>
					<Link to="/campaigns/$campaignId/admin" params={{ campaignId }}>
						Admin
					</Link>
				</div>
				<div className="text-slate-600">
					{currentCharacter ? (
						<span>Playing as {currentCharacter.name}</span>
					) : membership?.activeCharacterId ? (
						<span>Character selected for this campaign</span>
					) : (
						<span>No character selected</span>
					)}
				</div>
			</nav>
			<Outlet />
		</div>
	);
}
