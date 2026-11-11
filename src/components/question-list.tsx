"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { actielijnen, actielijnOrder, domainOrder, domains } from "@/data/taxonomy";
import type { Actielijn, DomainCode, MonitoringQuestion } from "@/data/types";
import { CoverageBar } from "./coverage-bar";
import { DomainIcon } from "./domain-icon";
import { FacetSelect, FilterRow, SearchField, StatusBar, Toolbar, type ActiveFilter } from "./filter-controls";

export function QuestionList({ questions }: { questions: MonitoringQuestion[] }) {
  const [domain, setDomain] = useState<DomainCode | null>(null);
  const [actielijn, setActielijn] = useState<Actielijn | null>(null);
  const [search, setSearch] = useState("");

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter(
      (x) =>
        (!domain || x.domains.includes(domain)) &&
        (!actielijn || x.blauwdruk.some((c) => c.startsWith(actielijn))) &&
        (!q || `${x.id} ${x.title} ${x.kernvraag ?? ""} ${x.variaties ?? ""}`.toLowerCase().includes(q))
    );
  }, [questions, domain, actielijn, search]);

  const active: ActiveFilter[] = [
    ...(search.trim() ? [{ key: "q", label: `“${search.trim()}”`, onRemove: () => setSearch("") }] : []),
    ...(domain ? [{ key: "d", label: `${domain}. ${domains[domain].short}`, onRemove: () => setDomain(null) }] : []),
    ...(actielijn
      ? [{ key: "a", label: `Actielijn ${actielijn}`, onRemove: () => setActielijn(null) }]
      : []),
  ];

  return (
    <div className="space-y-5">
      <Toolbar>
        <SearchField value={search} onChange={setSearch} placeholder="Zoek een monitoringsvraag" label="Zoek monitoringsvragen" />
        <FilterRow>
          <FacetSelect<DomainCode>
            label="Domein"
            value={domain}
            options={domainOrder.map((d) => ({ value: d, label: `${d}. ${domains[d].label}` }))}
            onChange={setDomain}
          />
          <FacetSelect<Actielijn>
            label="Actielijn G40"
            value={actielijn}
            options={actielijnOrder.map((a) => ({ value: a, label: `${a}. ${actielijnen[a].title}` }))}
            onChange={setActielijn}
          />
        </FilterRow>
        <StatusBar
          count={results.length}
          noun={["monitoringsvraag", "monitoringsvragen"]}
          active={active}
          onClear={() => {
            setSearch("");
            setDomain(null);
            setActielijn(null);
          }}
        />
      </Toolbar>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white shadow-dmi-sm">
        {results.map((q) => {
          const total = q.indicatorSlugs.length;
          return (
            <li key={q.id}>
              <Link href={`/vragen/${q.slug}`} className="grid gap-2 px-4 py-3 hover:bg-dmi-blue-050 sm:grid-cols-[4.5rem_1fr_9rem_10rem] sm:items-center">
                <span className="dmi-tag text-[11px] text-dmi-blue">{q.id}</span>
                <span className="min-w-0">
                  <span className="block font-medium text-dmi-navy">{q.title}</span>
                  {q.kernvraag && q.kernvraag !== q.title && (
                    <span className="line-clamp-1 text-xs text-muted-foreground">{q.kernvraag}</span>
                  )}
                </span>
                <span className="flex flex-wrap gap-1">
                  {q.domains.map((c) => (
                    <span key={c} title={domains[c].label} className="dmi-tag inline-flex h-5 items-center gap-1 rounded border border-dmi-blue-200/70 bg-dmi-blue-050 px-1.5 text-[10px] text-dmi-navy">
                      <DomainIcon code={c} className="size-3" /> {c}
                    </span>
                  ))}
                  {q.wensenlijst && (
                    <span className="dmi-tag inline-flex h-5 items-center rounded bg-[#fdf3dc] px-1.5 text-[10px] text-[#7a5410]">wens</span>
                  )}
                </span>
                <span>
                  <CoverageBar counts={q.counts} height={6} />
                  <span className="mt-1 block text-right text-[11px] text-muted-foreground tabular-nums">
                    {total} {total === 1 ? "indicator" : "indicatoren"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
