import type { ComponentPropsWithoutRef } from "react";
import { cn } from "#/lib/classnames";

export function Input({
	className,
	type = "text",
	...props
}: ComponentPropsWithoutRef<"input">) {
	return (
		<input
			type={type}
			className={cn(
				"w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
				className,
			)}
			{...props}
		/>
	);
}
