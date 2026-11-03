import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Indicator, MonitoringQuestion } from "@/data/types";
import { countByGeschiktheid } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { BlauwdrukChip } from "./blauwdruk-chip";
import { CoverageBar } from "./coverage-bar";
import { IndicatorRow } from "./indicator-row";

/** A monitoring question with its indicators: register first, rejected candidates folded. */
export function QuestionBlock({
  question: q,
  items,
  className,
}: {
  question: MonitoringQuestion;
  items: Indicator[];
  className?: string;
}) {
  const kept = items.filter((i) => i.inRegister);
  const rest = items.filter((i) => !i.inRegister);
  return (
    <article className={cn("rounded-xl border border-border bg-white shadow-dmi-sm", className)}>
      <header className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <Link href={`/vragen/${q.slug}`} className="group inline-flex items-baseline gap-2">
            <span className="dmi-tag text-[11px] text-dmi-blue">{q.id}</span>
            <h3 className="font-heading text-base font-semibold text-dmi-navy group-hover:underline">{q.title}</h3>
            <ChevronRight className="size-4 self-center text-muted-foreground" />
          </Link>
          {q.blauwdruk.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {q.blauwdruk.map((c) => (
                <BlauwdrukChip key={c} code={c} />
              ))}
            </div>
          )}
        </div>
        <div className="w-full shrink-0 sm:w-40">
          <CoverageBar counts={countByGeschiktheid(items)} />
          <p className="mt-1 text-right text-[11px] text-muted-foreground tabular-nums">
            {kept.length} in register · {items.length} beoordeeld
          </p>
        </div>
      </header>
      <div className="p-2">
        {kept.length > 0 ? (
          kept.map((i) => <IndicatorRow key={i.slug} indicator={i} />)
        ) : (
          <p className="px-3 py-2 text-sm text-muted-foreground">Nog geen geschikte indicator gevonden.</p>
        )}
        {rest.length > 0 && (
          <details className="group/details mt-1 rounded-lg">
            <summary className="cursor-pointer list-none px-3 py-1.5 text-xs text-dmi-blue hover:underline">
              <span className="group-open/details:hidden">Toon {rest.length} beoordeelde kandidaten die niet zijn opgenomen</span>
              <span className="hidden group-open/details:inline">Verberg niet-opgenomen kandidaten</span>
            </summary>
            <div className="mt-1 border-t border-dashed border-border pt-1 opacity-90">
              {rest.map((i) => (
                <IndicatorRow key={i.slug} indicator={i} />
              ))}
            </div>
          </details>
        )}
      </div>
    </article>
  );
}
