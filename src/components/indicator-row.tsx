import Link from "next/link";
import type { Indicator } from "@/data/types";
import { cn } from "@/lib/utils";
import { GeschiktheidBadge } from "./geschiktheid-badge";

export function IndicatorRow({ indicator: i, className }: { indicator: Indicator; className?: string }) {
  return (
    <Link
      href={`/indicatoren/${i.slug}`}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-dmi-blue-050",
        className
      )}
    >
      <span className="dmi-tag w-[4.5rem] shrink-0 text-[10px] text-muted-foreground">{i.indeling ?? i.id}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-dmi-navy group-hover:text-dmi-blue">{i.name}</span>
        {i.bron && <span className="block truncate text-xs text-muted-foreground">{i.bron}</span>}
      </span>
      <GeschiktheidBadge value={i.geschiktheid} />
    </Link>
  );
}
