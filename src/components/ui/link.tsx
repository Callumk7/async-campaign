import { type LinkProps, Link as TanstackLink } from "@tanstack/react-router";

export function Link({ ...props }: LinkProps) {
	return <TanstackLink className="text-blue-500 hover:underline" {...props} />;
}
