"use client";

import { motion } from "motion/react";
import { domainOrder, domains } from "@/data/taxonomy";
import { filterIndicators } from "@/lib/filters";
import { indicators } from "@/lib/selectors";
import { useFilterParams } from "@/lib/use-filter-params";
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
      <FilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={results.length}
        view={view}
        onViewChange={setView}
      />

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
