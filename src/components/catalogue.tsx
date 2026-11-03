"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { motion } from "motion/react";
import { domainOrder, domains } from "@/data/taxonomy";
import { filterIndicators } from "@/lib/filters";
import { indicators } from "@/lib/selectors";
import { useFilterParams, type View } from "@/lib/use-filter-params";
import { cn } from "@/lib/utils";
import { DomainIcon } from "./domain-icon";
import { FilterBar } from "./filter-bar";
import { IndicatorCard } from "./indicator-card";
import { IndicatorTable } from "./indicator-table";

export function Catalogue() {
  const { filters, view, setFilters, setView, query } = useFilterParams();
  const results = filterIndicators(indicators, filters);
  const backQuery = query ? `/indicatoren?${query}` : undefined;

  return (
    <div className="space-y-6">
      <div className="z-30 -mx-4 md:sticky md:top-14 lg:top-0 border-b border-border bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <FilterBar filters={filters} onChange={setFilters} resultCount={results.length} />
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Geen indicatoren gevonden. Pas de filters aan of kies <strong>Alle beoordeelde</strong>.
        </p>
      ) : view === "tabel" ? (
        <IndicatorTable items={results} backQuery={backQuery} />
      ) : (
        <div className="space-y-10">
          {domainOrder.map((code) => {
            const items = results.filter((i) => i.domain === code);
            if (!items.length) return null;
            return (
              <section key={code} aria-labelledby={`dom-${code}`}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-md bg-dmi-navy text-white">
                    <DomainIcon code={code} className="size-4" />
                  </span>
                  <h2 id={`dom-${code}`} className="font-heading text-lg font-semibold text-dmi-navy">
                    {code}. {domains[code].label}
                  </h2>
                  <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((i, idx) => (
                    <motion.div
                      key={i.slug}
                      initial={{ y: 8 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(idx, 12) * 0.02 }}
                    >
                      <IndicatorCard indicator={i} backQuery={backQuery} showDomain={false} />
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="hidden shrink-0 rounded-lg border border-border bg-white p-0.5 md:inline-flex" role="group" aria-label="Weergave">
      {(
        [
          ["kaarten", LayoutGrid, "Kaarten"],
          ["tabel", Table2, "Tabel"],
        ] as const
      ).map(([v, Icon, label]) => (
        <button
          key={v}
          type="button"
          aria-pressed={view === v}
          onClick={() => onChange(v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground",
            view === v && "bg-dmi-blue-100 text-dmi-navy"
          )}
        >
          <Icon className="size-3.5" /> {label}
        </button>
      ))}
    </div>
  );
}
