import { type LinkProps, Link as TanstackLink } from "@tanstack/react-router";
import { cn } from "~/lib/classnames";

type AppLinkProps = LinkProps & {
	className?: string;
};

export function Link({ className, ...props }: AppLinkProps) {
	return (
		<TanstackLink
			className={cn("text-blue-500 hover:underline", className)}
			{...props}
		/>
	);
}
