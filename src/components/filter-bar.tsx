"use client";

import { Search, X } from "lucide-react";
import {
  domainOrder,
  domains,
  frequentieOrder,
  geschiktheidColors,
  geschiktheidLabels,
  geschiktheidOrder,
  indicatorTypes,
  schaalLabels,
  schaalOrder,
  type Schaal,
} from "@/data/taxonomy";
import type { DomainCode, Geschiktheid } from "@/data/types";
import { activeFilterCount, emptyFilters, type Filters } from "@/lib/filters";
import { bronOptions, totals } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function FacetSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (v: T | null) => void;
}) {
  return (
    <label className="relative inline-flex min-w-0 items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value || null) as T | null)}
        className={cn(
          "h-8 max-w-[14rem] appearance-none truncate rounded-lg border border-border bg-white pl-2.5 pr-7 text-sm text-dmi-navy outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
          value && "border-dmi-blue bg-dmi-blue-100 font-medium"
        )}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-2 size-3.5 text-muted-foreground" viewBox="0 0 16 16" aria-hidden>
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </label>
  );
}

export function FilterBar({
  filters,
  onChange,
  resultCount,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const visibleGeschiktheid: Geschiktheid[] =
    filters.scope === "register" ? ["goed", "gewenst"] : geschiktheidOrder;

  const toggleG = (g: Geschiktheid) =>
    set({
      geschiktheid: filters.geschiktheid.includes(g)
        ? filters.geschiktheid.filter((x) => x !== g)
        : [...filters.geschiktheid, g],
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Zoek op naam, bron, code of toelichting…"
            className="h-9 bg-white pl-8"
            aria-label="Zoek indicatoren"
          />
        </div>
        <div className="inline-flex rounded-lg border border-border bg-white p-0.5" role="group" aria-label="Reikwijdte">
          {(
            [
              ["register", `Register v0.91 (${totals.register})`],
              ["alle", `Alle beoordeelde (${totals.indicators})`],
            ] as const
          ).map(([scope, label]) => (
            <button
              key={scope}
              type="button"
              aria-pressed={filters.scope === scope}
              onClick={() =>
                set({
                  scope,
                  geschiktheid: filters.geschiktheid.filter((g) =>
                    scope === "alle" ? true : g === "goed" || g === "gewenst"
                  ),
                })
              }
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
                filters.scope === scope && "bg-dmi-navy text-white"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&>*]:shrink-0">
        {visibleGeschiktheid.map((g) => {
          const on = filters.geschiktheid.includes(g);
          return (
            <button
              key={g}
              type="button"
              aria-pressed={on}
              onClick={() => toggleG(g)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                on ? "border-dmi-navy bg-dmi-navy text-white" : "border-border bg-white text-dmi-navy hover:bg-dmi-blue-050"
              )}
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: geschiktheidColors[g] }} />
              {geschiktheidLabels[g]}
            </button>
          );
        })}
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
        <FacetSelect<DomainCode>
          label="Alle domeinen"
          value={filters.domain}
          options={domainOrder.map((d) => ({ value: d, label: `${d}. ${domains[d].label}` }))}
          onChange={(domain) => set({ domain })}
        />
        <FacetSelect
          label="Alle bronnen"
          value={filters.bron}
          options={bronOptions.map((b) => ({ value: b.value, label: `${b.value} (${b.count})` }))}
          onChange={(bron) => set({ bron })}
        />
        <FacetSelect<Schaal>
          label="Elk schaalniveau"
          value={filters.schaal}
          options={schaalOrder.map((s) => ({ value: s, label: schaalLabels[s] }))}
          onChange={(schaal) => set({ schaal })}
        />
        <FacetSelect
          label="Elk indicatortype"
          value={filters.type === null ? null : String(filters.type)}
          options={indicatorTypes.map((t) => ({ value: String(t.value), label: `${t.value}. ${t.label}` }))}
          onChange={(v) => set({ type: v === null ? null : Number(v) })}
        />
        <FacetSelect
          label="Elke frequentie"
          value={filters.frequentie}
          options={frequentieOrder.map((f) => ({ value: f, label: f }))}
          onChange={(frequentie) => set({ frequentie })}
        />
        {activeFilterCount(filters) + (filters.search ? 1 : 0) > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onChange(emptyFilters)} className="text-muted-foreground">
            <X /> Wis filters
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground tabular-nums" aria-live="polite">
          {resultCount} {resultCount === 1 ? "indicator" : "indicatoren"}
        </span>
      </div>
    </div>
  );
}
