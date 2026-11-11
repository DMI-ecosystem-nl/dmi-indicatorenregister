"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { domainOrder, schaalOrder, type Schaal } from "@/data/taxonomy";
import type { DomainCode, RegisterGeschiktheid } from "@/data/types";
import type { Filters } from "@/lib/filters";

export type View = "kaarten" | "tabel";
const VIEWS: View[] = ["kaarten", "tabel"];

/** Geschiktheid in the URL by its label (`g=geschikt,gewenst`); `goed` keeps old links working. */
const G_PARAM: Record<RegisterGeschiktheid, string> = { goed: "geschikt", gewenst: "gewenst" };
const G_FROM_PARAM: Record<string, RegisterGeschiktheid> = { geschikt: "goed", goed: "goed", gewenst: "gewenst" };

/**
 * Filter state lives in the query string so every filtered view — and the way
 * back from an indicator page — is a shareable link.
 */
export function useFilterParams() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: Filters = useMemo(() => {
    const one = <T extends string>(key: string, allowed: readonly T[]): T | null => {
      const value = searchParams.get(key);
      return value && (allowed as readonly string[]).includes(value) ? (value as T) : null;
    };
    const domain = searchParams.get("domein")?.toUpperCase() ?? null;
    const type = searchParams.get("type");
    return {
      geschiktheid: [
        ...new Set(
          (searchParams.get("g") ?? "")
            .split(",")
            .map((g) => G_FROM_PARAM[g])
            .filter(Boolean)
        ),
      ],
      domain: domain && (domainOrder as string[]).includes(domain) ? (domain as DomainCode) : null,
      bron: searchParams.get("bron"),
      schaal: one<Schaal>("schaal", schaalOrder),
      type: type !== null && /^\d$/.test(type) ? Number(type) : null,
      frequentie: searchParams.get("freq"),
      search: searchParams.get("q") ?? "",
    };
  }, [searchParams]);

  const requested = searchParams.get("view") as View | null;
  const view: View = requested && VIEWS.includes(requested) ? requested : "kaarten";

  const write = useCallback(
    (next: Filters, nextView: View) => {
      const params = new URLSearchParams();
      if (next.geschiktheid.length) params.set("g", next.geschiktheid.map((g) => G_PARAM[g]).join(","));
      if (next.domain) params.set("domein", next.domain.toLowerCase());
      if (next.bron) params.set("bron", next.bron);
      if (next.schaal) params.set("schaal", next.schaal);
      if (next.type !== null) params.set("type", String(next.type));
      if (next.frequentie) params.set("freq", next.frequentie);
      if (next.search.trim()) params.set("q", next.search);
      if (nextView !== "kaarten") params.set("view", nextView);
      const query = params.toString();
      // Native history API: instant, no server round-trip, and Next.js keeps
      // useSearchParams() in sync.
      window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
    },
    [pathname]
  );

  const setFilters = useCallback((next: Filters) => write(next, view), [write, view]);
  const setView = useCallback((nextView: View) => write(filters, nextView), [write, filters]);

  return { filters, view, setFilters, setView, query: searchParams.toString() };
}
