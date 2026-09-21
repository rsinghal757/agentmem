import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "toolbar"
  | "link";
type ButtonSize = "xs" | "sm" | "default" | "lg" | "icon" | "icon-sm";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "border-[color-mix(in_oklab,var(--brand),var(--text-strong)_26%)] bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--brand),white_10%)] active:brightness-[0.92]",
  destructive:
    "border-transparent bg-destructive text-destructive-foreground hover:brightness-110 active:brightness-95",
  outline:
    "border-border bg-card text-[var(--text-strong)] shadow-[var(--shadow-control)] hover:bg-[var(--surface-hover)]",
  secondary:
    "border-transparent bg-secondary text-secondary-foreground hover:bg-[var(--surface-active)]",
  ghost:
    "border-transparent bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)]",
  toolbar:
    "border-transparent bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)] data-[active=true]:bg-[var(--brand-tint)] data-[active=true]:text-[var(--brand-deep)]",
  link: "border-transparent text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-6 gap-1 px-2 text-[12px]",
  sm: "h-7 gap-1.5 px-2.5 text-[12px]",
  default: "h-8 gap-1.5 px-3 text-[13px]",
  lg: "h-[42px] gap-2 px-4 text-[15px] font-medium",
  icon: "h-8 w-8",
  "icon-sm": "h-7 w-7",
};

export type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "sq-control focus-ring inline-flex shrink-0 items-center justify-center whitespace-nowrap border font-normal outline-none transition-[color,background-color,border-color,box-shadow,filter] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
