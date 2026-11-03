import Link from "next/link";
import { domains } from "@/data/taxonomy";
import type { DomainCode } from "@/data/types";
import { cn } from "@/lib/utils";
import { DomainIcon } from "./domain-icon";

export function DomainBadge({
  code,
  link = false,
  short = true,
  className,
}: {
  code: DomainCode;
  link?: boolean;
  short?: boolean;
  className?: string;
}) {
  const d = domains[code];
  const body = (
    <>
      <span className="dmi-tag text-[10px] font-medium text-dmi-navy/70">{code}</span>
      <DomainIcon code={code} className="size-3.5 text-dmi-blue" />
      <span className="truncate">{short ? d.short : d.label}</span>
    </>
  );
  const cls = cn(
    "inline-flex max-w-full items-center gap-1.5 rounded-md border border-dmi-blue-200/70 bg-dmi-blue-050 px-2 h-6 text-xs text-dmi-navy",
    link && "hover:border-dmi-blue hover:bg-dmi-blue-100 transition-colors",
    className
  );
  return link ? (
    <Link href={`/domeinen/${d.slug}`} className={cls}>
      {body}
    </Link>
  ) : (
    <span className={cls}>{body}</span>
  );
}
