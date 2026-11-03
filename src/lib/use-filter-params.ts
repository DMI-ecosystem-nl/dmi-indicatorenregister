"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { domainOrder, geschiktheidOrder, schaalOrder, type Schaal } from "@/data/taxonomy";
import type { DomainCode, Geschiktheid } from "@/data/types";
import type { Filters } from "@/lib/filters";

export type View = "kaarten" | "tabel";
const VIEWS: View[] = ["kaarten", "tabel"];

/**
 * Filter state lives in the query string so every filtered view — and the way
 * back from an indicator page — is a shareable link.
 */
export function useFilterParams() {
  const router = useRouter();
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
      scope: searchParams.get("scope") === "alle" ? "alle" : "register",
      geschiktheid: (searchParams.get("g") ?? "")
        .split(",")
        .filter((g): g is Geschiktheid => (geschiktheidOrder as string[]).includes(g)),
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
      if (next.scope !== "register") params.set("scope", next.scope);
      if (next.geschiktheid.length) params.set("g", next.geschiktheid.join(","));
      if (next.domain) params.set("domein", next.domain.toLowerCase());
      if (next.bron) params.set("bron", next.bron);
      if (next.schaal) params.set("schaal", next.schaal);
      if (next.type !== null) params.set("type", String(next.type));
      if (next.frequentie) params.set("freq", next.frequentie);
      if (next.search.trim()) params.set("q", next.search);
      if (nextView !== "kaarten") params.set("view", nextView);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const setFilters = useCallback((next: Filters) => write(next, view), [write, view]);
  const setView = useCallback((nextView: View) => write(filters, nextView), [write, filters]);

  return { filters, view, setFilters, setView, query: searchParams.toString() };
}
