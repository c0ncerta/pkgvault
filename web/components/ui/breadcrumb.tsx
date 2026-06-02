import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      style={{
        fontSize: "var(--fs-base)",
        color: "var(--color-text-muted)",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {items.map((item, i) => (
        <span key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {i > 0 && <span style={{ opacity: 0.4 }}>/</span>}
          {item.href ? (
            <Link
              href={item.href}
              style={{ color: "var(--color-accent-hover)", textDecoration: "none" }}
            >
              {item.label}
            </Link>
          ) : (
            <span style={{ color: "var(--color-text-secondary)" }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
