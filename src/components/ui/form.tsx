import type { ComponentPropsWithoutRef } from "react";
import { cn } from "#/lib/classnames";

export function Form({
	className,
	...props
}: ComponentPropsWithoutRef<"form">) {
	return <form className={cn("flex flex-col gap-4", className)} {...props} />;
}

export function Field({
	className,
	...props
}: ComponentPropsWithoutRef<"div">) {
	return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

export function Label({
	className,
	...props
}: ComponentPropsWithoutRef<"label">) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: Label is a reusable wrapper; callers provide htmlFor or nest a control.
		<label
			className={cn("text-sm font-medium text-slate-700", className)}
			{...props}
		/>
	);
}

export function FieldDescription({
	className,
	...props
}: ComponentPropsWithoutRef<"p">) {
	return <p className={cn("text-sm text-slate-500", className)} {...props} />;
}

export function FieldError({
	className,
	...props
}: ComponentPropsWithoutRef<"p">) {
	return <p className={cn("text-sm text-red-600", className)} {...props} />;
}
