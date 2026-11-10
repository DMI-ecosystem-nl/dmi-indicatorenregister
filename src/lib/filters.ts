import { schaalOf } from "@/lib/selectors";
import type { Schaal } from "@/data/taxonomy";
import type { DomainCode, Geschiktheid, Indicator } from "@/data/types";

export type Scope = "register" | "alle";

export interface Filters {
  /** "register" = the current register (Goed + Gewenst), "alle" = every assessed indicator. */
  scope: Scope;
  /** Empty = no restriction within the scope. */
  geschiktheid: Geschiktheid[];
  domain: DomainCode | null;
  bron: string | null;
  schaal: Schaal | null;
  type: number | null;
  frequentie: string | null;
  search: string;
}

export const emptyFilters: Filters = {
  scope: "register",
  geschiktheid: [],
  domain: null,
  bron: null,
  schaal: null,
  type: null,
  frequentie: null,
  search: "",
};

export function activeFilterCount(filters: Filters): number {
  return (
    (filters.scope !== "register" ? 1 : 0) +
    (filters.geschiktheid.length ? 1 : 0) +
    [filters.domain, filters.bron, filters.schaal, filters.type, filters.frequentie].filter(
      (v) => v !== null
    ).length
  );
}

/** Every searchable string of an indicator, lowercased. */
function haystack(i: Indicator): string {
  return [
    i.id,
    i.indeling,
    i.name,
    i.vraagId,
    i.cluster,
    i.bron,
    i.bronLabel,
    i.beheerder,
    i.dataverzamelaar,
    i.toelichting,
    i.meetmethode,
    // Earlier names, so old bookmarks and notes still find the indicator.
    ...i.changes.filter((c) => c.field === "name").map((c) => c.from),
    i.blauwdruk.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * One predicate for every view (cards, table, counts), AND across facets —
 * so the views can never disagree.
 */
export function filterIndicators(items: Indicator[], filters: Filters): Indicator[] {
  const terms = filters.search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((i) => {
    if (filters.scope === "register" && !i.inRegister) return false;
    if (filters.geschiktheid.length && !filters.geschiktheid.includes(i.geschiktheid))
      return false;
    if (filters.domain && i.domain !== filters.domain) return false;
    if (filters.bron && i.bron !== filters.bron) return false;
    if (filters.schaal && schaalOf(i) !== filters.schaal) return false;
    if (filters.type !== null && i.type !== filters.type) return false;
    if (filters.frequentie && i.frequentie !== filters.frequentie) return false;
    if (terms.length) {
      const text = haystack(i);
      if (!terms.every((t) => text.includes(t))) return false;
    }
    return true;
  });
}
