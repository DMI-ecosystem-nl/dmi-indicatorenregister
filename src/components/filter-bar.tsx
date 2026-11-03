"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import {
  domainOrder,
  domains,
  frequentieOrder,
  geschiktheidColors,
  geschiktheidLabels,
  geschiktheidOrder,
  indicatorTypeLabel,
  indicatorTypes,
  schaalLabels,
  schaalOrder,
  type Schaal,
} from "@/data/taxonomy";
import type { DomainCode, Geschiktheid } from "@/data/types";
import { emptyFilters, type Filters } from "@/lib/filters";
import { bronOptions, totals } from "@/lib/selectors";
import type { View } from "@/lib/use-filter-params";
import {
  FacetSelect,
  FilterRow,
  SearchField,
  Segmented,
  StatusBar,
  ToggleGroup,
  Toolbar,
  type ActiveFilter,
} from "./filter-controls";

export function FilterBar({
  filters,
  onChange,
  resultCount,
  view,
  onViewChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
  view: View;
  onViewChange: (v: View) => void;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const visibleG: Geschiktheid[] = filters.scope === "register" ? ["goed", "gewenst"] : geschiktheidOrder;

  const active: ActiveFilter[] = [
    ...(filters.search.trim()
      ? [{ key: "q", label: `“${filters.search.trim()}”`, onRemove: () => set({ search: "" }) }]
      : []),
    ...filters.geschiktheid.map((g) => ({
      key: `g-${g}`,
      label: geschiktheidLabels[g],
      onRemove: () => set({ geschiktheid: filters.geschiktheid.filter((x) => x !== g) }),
    })),
    ...(filters.domain
      ? [{ key: "d", label: `${filters.domain}. ${domains[filters.domain].short}`, onRemove: () => set({ domain: null }) }]
      : []),
    ...(filters.bron ? [{ key: "b", label: filters.bron, onRemove: () => set({ bron: null }) }] : []),
    ...(filters.schaal ? [{ key: "s", label: schaalLabels[filters.schaal], onRemove: () => set({ schaal: null }) }] : []),
    ...(filters.type !== null
      ? [{ key: "t", label: `Type: ${indicatorTypeLabel(filters.type)}`, onRemove: () => set({ type: null }) }]
      : []),
    ...(filters.frequentie ? [{ key: "f", label: filters.frequentie, onRemove: () => set({ frequentie: null }) }] : []),
  ];

  return (
    <Toolbar>
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap">
        <SearchField
          value={filters.search}
          onChange={(search) => set({ search })}
          placeholder="Zoek op naam, bron of code"
          label="Zoek indicatoren"
        />
        <Segmented
          label="Reikwijdte"
          value={filters.scope}
          onChange={(scope) =>
            set({
              scope,
              geschiktheid:
                scope === "alle" ? filters.geschiktheid : filters.geschiktheid.filter((g) => g === "goed" || g === "gewenst"),
            })
          }
          options={[
            { value: "register", label: <>Register <span className="tabular-nums opacity-70">{totals.register}</span></> },
            { value: "alle", label: <>Alle beoordeelde <span className="tabular-nums opacity-70">{totals.indicators}</span></> },
          ]}
        />
        <ToggleGroup
          label="Geschiktheid"
          values={filters.geschiktheid}
          options={visibleG.map((g) => ({ value: g, label: geschiktheidLabels[g], dot: geschiktheidColors[g] }))}
          onToggle={(g) =>
            set({
              geschiktheid: filters.geschiktheid.includes(g)
                ? filters.geschiktheid.filter((x) => x !== g)
                : [...filters.geschiktheid, g],
            })
          }
        />
      </div>

      <FilterRow>
        <FacetSelect<DomainCode>
          label="Domein"
          value={filters.domain}
          options={domainOrder.map((d) => ({ value: d, label: `${d}. ${domains[d].label}` }))}
          onChange={(domain) => set({ domain })}
        />
        <FacetSelect
          label="Bron"
          value={filters.bron}
          options={bronOptions.map((b) => ({ value: b.value, label: `${b.value} (${b.count})` }))}
          onChange={(bron) => set({ bron })}
        />
        <FacetSelect<Schaal>
          label="Schaalniveau"
          value={filters.schaal}
          options={schaalOrder.map((s) => ({ value: s, label: schaalLabels[s] }))}
          onChange={(schaal) => set({ schaal })}
        />
        <FacetSelect
          label="Indicatortype"
          value={filters.type === null ? null : String(filters.type)}
          options={indicatorTypes.map((t) => ({ value: String(t.value), label: `${t.value}. ${t.label}` }))}
          onChange={(v) => set({ type: v === null ? null : Number(v) })}
        />
        <FacetSelect
          label="Frequentie"
          value={filters.frequentie}
          options={frequentieOrder.map((f) => ({ value: f, label: f }))}
          onChange={(frequentie) => set({ frequentie })}
        />
      </FilterRow>

      <StatusBar
        count={resultCount}
        noun={["indicator", "indicatoren"]}
        active={active}
        onClear={() => onChange({ ...emptyFilters, scope: filters.scope })}
      >
        <Segmented
          label="Weergave"
          value={view}
          onChange={onViewChange}
          className="hidden h-9 md:inline-flex"
          options={[
            { value: "kaarten", label: <><LayoutGrid className="size-3.5" /> Kaarten</> },
            { value: "tabel", label: <><Table2 className="size-3.5" /> Tabel</> },
          ]}
        />
      </StatusBar>
    </Toolbar>
  );
}
