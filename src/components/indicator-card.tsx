import Link from "next/link";
import { ArrowUpRight, CalendarClock, Layers } from "lucide-react";
import { schaalLabels } from "@/data/taxonomy";
import type { Indicator } from "@/data/types";
import { getQuestion, schaalOf } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { DomainBadge } from "./domain-badge";
import { GeschiktheidBadge } from "./geschiktheid-badge";

export function IndicatorCard({
  indicator: i,
  backQuery,
  showDomain = true,
  className,
}: {
  indicator: Indicator;
  backQuery?: string;
  showDomain?: boolean;
  className?: string;
}) {
  const question = getQuestion(i.vraagId);
  const schaal = schaalOf(i);
  const href = `/indicatoren/${i.slug}${backQuery ? `?terug=${encodeURIComponent(backQuery)}` : ""}`;
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full flex-col gap-3 rounded-xl border border-border bg-white p-4 shadow-dmi-sm transition-all hover:-translate-y-0.5 hover:border-dmi-blue-200 hover:shadow-dmi-md",
        !i.inRegister && "bg-white/70",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="dmi-tag text-[10px] text-muted-foreground">{i.indeling ?? i.id}</span>
        <GeschiktheidBadge value={i.geschiktheid} className="ml-auto" />
      </div>
      <div className="min-w-0">
        <h3 className="font-heading text-[15px] font-semibold leading-snug text-dmi-navy group-hover:text-dmi-blue">
          {i.name}
        </h3>
        {question && (
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            <span className="text-dmi-navy/60">{question.id}</span> · {question.title}
          </p>
        )}
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        {i.bron && (
          <span className="inline-flex min-w-0 max-w-full items-center gap-1 font-medium text-dmi-navy/80">
            <ArrowUpRight className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{i.bron}</span>
          </span>
        )}
        {schaal !== "onbekend" && (
          <span className="inline-flex items-center gap-1">
            <Layers className="size-3" aria-hidden /> {schaalLabels[schaal]}
          </span>
        )}
        {i.meestRecentJaar && (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="size-3" aria-hidden /> {i.meestRecentJaar}
          </span>
        )}
      </div>
      {showDomain && <DomainBadge code={i.domain} className="self-start" />}
    </Link>
  );
}
