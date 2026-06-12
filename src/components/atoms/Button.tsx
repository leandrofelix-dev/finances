"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Button as ShadButton } from "./base-button";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "alert" | "loading";
type ButtonSize = "default" | "sm" | "lg" | "icon";

type ButtonProps = Omit<React.ComponentProps<typeof ShadButton>, "size" | "variant"> & {
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantMap: Record<ButtonVariant, React.ComponentProps<typeof ShadButton>["variant"]> = {
  primary: "default",
  secondary: "outline",
  danger: "destructive",
  alert: "alert",
  loading: "loading",
};

const sizeMap: Record<ButtonSize, React.ComponentProps<typeof ShadButton>["size"]> = {
  default: "default",
  sm: "sm",
  lg: "lg",
  icon: "icon",
};

export function Button({
  children,
  className,
  disabled,
  loading,
  variant = "primary",
  size = "default",
  ...props
}: ButtonProps) {
  const isLoading = loading || variant === "loading";

  return (
    <ShadButton
      className={className}
      disabled={disabled || isLoading}
      size={sizeMap[size]}
      variant={variantMap[isLoading ? "loading" : variant]}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin" size={15} /> : null}
      {children}
    </ShadButton>
  );
}

export function IconButton({
  children,
  label,
  title,
  className,
  variant = "secondary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  label: string;
  variant?: Exclude<ButtonVariant, "loading">;
}) {
  return (
    <ShadButton
      aria-label={label}
      className={cn(
        "size-8",
        className
      )}
      size="icon"
      title={title ?? label}
      variant={variantMap[variant]}
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
