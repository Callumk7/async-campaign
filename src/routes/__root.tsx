import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useAuth } from "#/components/auth/auth-provider";
import { Link } from "#/components/ui/link";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { clearSelectedUser, selectedUser, isAuthenticated } = useAuth();
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<nav className="flex flex-wrap items-center gap-3 bg-slate-900 p-3 text-white">
					<Link to="/">Home</Link>
					<Link to="/campaigns">Campaigns</Link>
					<Link to="/users">Users</Link>
					<span className="ml-auto text-sm text-slate-300">
						{selectedUser?.name ??
							(isAuthenticated ? "Loading user..." : "Guest")}
					</span>
					{isAuthenticated && (
						<button type="button" onClick={clearSelectedUser}>
							Logout
						</button>
					)}
				</nav>
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
