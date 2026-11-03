import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  href?: string;
  label: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  children,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-border bg-dmi-blue-050 dmi-grid-bg", className)}>
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Kruimelpad" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-dmi-navy">Register</Link>
            {crumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <ChevronRight className="size-3" aria-hidden />
                {c.href ? (
                  <Link href={c.href} className="hover:text-dmi-navy">{c.label}</Link>
                ) : (
                  <span className="text-dmi-navy">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <div className="dmi-tag mb-2 text-[11px] text-dmi-blue">{eyebrow}</div>}
        <h1 className="max-w-4xl font-heading text-3xl font-semibold tracking-tight text-dmi-navy sm:text-4xl">
          {title}
        </h1>
        {description && <div className="mt-3 max-w-3xl text-base text-muted-foreground">{description}</div>}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </section>
  );
}

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}
