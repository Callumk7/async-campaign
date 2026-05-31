import {
	Link as RouterLink,
	type LinkProps as RouterLinkProps,
} from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { buttonVariants } from "./button";

interface LinkProps
	extends RouterLinkProps,
		VariantProps<typeof buttonVariants> {
	className?: string;
}

function Link({
	className,
	variant = "link",
	size = "default",
	...props
}: LinkProps) {
	return (
		<RouterLink
			data-slot="link"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Link };
