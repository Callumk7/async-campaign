import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../auth/auth-provider";
import { Button } from "../ui/button";
import { Link } from "../ui/link";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuRouterLink,
	NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { Spinner } from "../ui/spinner";

export function Header() {
	const { clearSelectedUser, selectedUser, isAuthenticated } = useAuth();
	const {
		data: userCampaigns,
		isPending,
		isError,
	} = useQuery(
		convexQuery(
			api.campaigns.getByCampaignMember,
			selectedUser?._id ? { userId: selectedUser._id } : "skip",
		),
	);
	return (
		<div className="flex justify-between w-full border-b border-border p-4">
			<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuRouterLink to="/">Home</NavigationMenuRouterLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Campaigns</NavigationMenuTrigger>
						<NavigationMenuContent>
							{isPending ? (
								<div className="flex items-center justify-center">
									<Spinner />
								</div>
							) : isError ? (
								<div className="flex items-center justify-center">
									<p>Error loading campaigns</p>
								</div>
							) : (
								userCampaigns.map((campaign) => (
									<NavigationMenuRouterLink
										key={campaign.campaign._id}
										to="/campaigns/$campaignId"
										params={{ campaignId: campaign.campaign._id }}
									>
										{campaign.campaign.name}
									</NavigationMenuRouterLink>
								))
							)}
							<NavigationMenuRouterLink to="/campaigns/new">
								Create new campaign
							</NavigationMenuRouterLink>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuRouterLink to="/users">
							Users
						</NavigationMenuRouterLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
			<div className="flex gap-4 items-center text-sm text-amber-600">
				<span>Hello {selectedUser?.name}</span>
				{isAuthenticated ? (
					<Button onClick={clearSelectedUser}>Logout</Button>
				) : (
					<Link variant="secondary" to="/login">
						Login
					</Link>
				)}
			</div>
		</div>
	);
}
