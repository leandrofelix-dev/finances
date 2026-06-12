"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Button as ShadButton } from "./base-button";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "default" | "sm" | "lg" | "icon";

type ButtonProps = Omit<React.ComponentProps<typeof ShadButton>, "size" | "variant"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantMap: Record<ButtonVariant, React.ComponentProps<typeof ShadButton>["variant"]> = {
  primary: "default",
  secondary: "outline",
  danger: "destructive",
};

const sizeMap: Record<ButtonSize, React.ComponentProps<typeof ShadButton>["size"]> = {
  default: "default",
  sm: "sm",
  lg: "lg",
  icon: "icon",
};

export function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonProps) {
  return <ShadButton className={className} size={sizeMap[size]} variant={variantMap[variant]} {...props} />;
}

export function IconButton({
  children,
  label,
  title,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; label: string }) {
  return (
    <ShadButton
      aria-label={label}
      className={cn(
        "size-8 border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
      size="icon"
      title={title ?? label}
      variant="outline"
      {...props}
    >
      {children}
    </ShadButton>
  );
}

export function BackButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <IconButton
      aria-label="Voltar"
      className={cn("size-9 text-foreground", className)}
      label="Voltar"
      title="Voltar"
      {...props}
    >
      {children}
    </IconButton>
  );
}
