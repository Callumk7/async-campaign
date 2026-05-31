import type { ButtonHTMLAttributes } from "react";
import { cn } from "~/lib/classnames";

export function Button({
	className,
	...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={cn(
				"inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600",
				className,
			)}
			{...props}
		/>
	);
}
