"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { domainOrder, domains } from "@/data/taxonomy";
import type { DomainCode, MonitoringQuestion } from "@/data/types";
import { cn } from "@/lib/utils";
import { CoverageBar } from "./coverage-bar";
import { DomainIcon } from "./domain-icon";
import { Input } from "./ui/input";

export function QuestionList({ questions }: { questions: MonitoringQuestion[] }) {
  const [domain, setDomain] = useState<DomainCode | null>(null);
  const [onlyRegister, setOnlyRegister] = useState(false);
  const [search, setSearch] = useState("");

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter(
      (x) =>
        (!domain || x.domains.includes(domain)) &&
        (!onlyRegister || x.inRegister) &&
        (!q || `${x.id} ${x.title} ${x.kernvraag ?? ""} ${x.variaties ?? ""}`.toLowerCase().includes(q))
    );
  }, [questions, domain, onlyRegister, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek een monitoringsvraag…"
            className="h-9 bg-white pl-8"
            aria-label="Zoek monitoringsvragen"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip on={!domain} onClick={() => setDomain(null)}>Alle domeinen</Chip>
          {domainOrder.map((c) => (
            <Chip key={c} on={domain === c} onClick={() => setDomain(domain === c ? null : c)}>
              <DomainIcon code={c} className="size-3.5" /> {domains[c].short}
            </Chip>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-dmi-navy md:ml-auto">
          <input
            type="checkbox"
            checked={onlyRegister}
            onChange={(e) => setOnlyRegister(e.target.checked)}
            className="size-4 accent-[var(--dmi-navy)]"
          />
          Alleen met indicator in register
        </label>
      </div>
      <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
        {results.length} monitoringsvragen
      </p>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white shadow-dmi-sm">
        {results.map((q) => {
          const total = q.indicatorSlugs.length;
          const reg = q.counts.goed + q.counts.gewenst;
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
                    {reg} / {total} in register
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

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs transition-colors",
        on ? "border-dmi-navy bg-dmi-navy text-white" : "border-border bg-white text-dmi-navy hover:bg-dmi-blue-050"
      )}
    >
      {children}
    </button>
  );
}
