import type { Id } from "../../../convex/_generated/dataModel";
import { Link } from "../ui/link";

interface CampaignNavigationProps {
	campaignId: Id<"campaigns">;
}

export function CampaignNavigation({ campaignId }: CampaignNavigationProps) {
	return (
		<nav className="flex p-4 gap-4 justify-between">
			<div className="flex items-center gap-4">
				<Link to="/campaigns/$campaignId" params={{ campaignId }}>
					Overview
				</Link>
				<Link to="/campaigns/$campaignId" params={{ campaignId }}>
					Quests
				</Link>
				<Link to="/campaigns/$campaignId/play" params={{ campaignId }}>
					Play
				</Link>
				<Link to="/campaigns/$campaignId/character" params={{ campaignId }}>
					Character
				</Link>
				<Link to="/campaigns/$campaignId/journal" params={{ campaignId }}>
					Journal
				</Link>
			</div>
			<div className="flex items-center gap-4">
				<span>Character stuff maybe</span>
			</div>
		</nav>
	);
}
