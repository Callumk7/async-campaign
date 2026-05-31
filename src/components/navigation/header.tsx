import type { LinkProps } from "@tanstack/react-router";
import { useAuth } from "../auth/auth-provider";
import { Button } from "../ui/button";
import { Link } from "../ui/link";

const links: { to: LinkProps["to"]; label: string }[] = [
	{ to: "/", label: "Home" },
	{ to: "/campaigns", label: "Campaigns" },
	{ to: "/users", label: "Users" },
];

export function Header() {
	const { clearSelectedUser, selectedUser, isAuthenticated } = useAuth();
	return (
		<nav className="bg-cyan-950 p-3 text-white flex flex-row justify-between">
			<ul className="flex flex-row items-center gap-3">
				{links.map((link) => (
					<li key={link.to}>
						<Link to={link.to}>{link.label}</Link>
					</li>
				))}
			</ul>
			{isAuthenticated && (
				<div className="flex flex-row items-center gap-2">
					<div className="text-white">
						<Link to="/users/me">
							{selectedUser?.name ?? "No user selected"}
						</Link>
					</div>
					<Button onClick={clearSelectedUser}>Logout</Button>
				</div>
			)}
		</nav>
	);
}
