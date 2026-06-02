import type { ReactNode } from "react";

type TagVariant = "default" | "accent" | "success" | "warning" | "danger";

interface TagProps {
  children: ReactNode;
  variant?: TagVariant;
  className?: string;
}

const variantClasses: Record<TagVariant, string> = {
  default: "tag",
  accent: "tag tag-accent",
  success: "tag tag-success",
  warning: "tag tag-warning",
  danger: "tag tag-warning",
};

export function Tag({ children, variant = "default", className = "" }: TagProps) {
  return <span className={`${variantClasses[variant]} ${className}`}>{children}</span>;
}
