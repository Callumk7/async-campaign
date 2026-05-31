import type { LinkProps } from "@tanstack/react-router";
import { Link } from "../ui/link";

const links: { to: LinkProps["to"]; label: string }[] = [
	{ to: "/", label: "Home" },
	{ to: "/campaigns", label: "Campaigns" },
	{ to: "/users", label: "Users" },
];

export function Header() {
	return (
		<nav>
			<ul>
				{links.map((link) => (
					<li key={link.to}>
						<Link to={link.to}>{link.label}</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}
