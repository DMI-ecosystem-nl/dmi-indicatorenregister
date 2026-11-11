"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MousePointer2 } from "lucide-react";
import { actielijnen, domains, geschiktheidColors, geschiktheidLabels, registerGeschiktheid } from "@/data/taxonomy";
import type { Actielijn, DomainCode, RegisterGeschiktheid as Geschiktheid } from "@/data/types";
import { cn } from "@/lib/utils";
import { GeschiktheidBadge } from "./geschiktheid-badge";

export interface MatrixAction {
  id: string;
  slug: string;
  actielijn: Actielijn;
  text: string;
  best: Geschiktheid | null;
}
export interface MatrixIndicator {
  slug: string;
  code: string;
  name: string;
  geschiktheid: Geschiktheid;
}
export interface MatrixRow {
  id: string;
  slug: string;
  title: string;
  domain: DomainCode;
  best: Geschiktheid | null;
  codes: string[];
  indicators: MatrixIndicator[];
}

type Focus =
  | { kind: "action"; action: MatrixAction }
  | { kind: "row"; row: MatrixRow }
  | { kind: "cell"; row: MatrixRow; action: MatrixAction };

const CELL = 13;

export function BlueprintMatrix({ actions, rows }: { actions: MatrixAction[]; rows: MatrixRow[] }) {
  const [focus, setFocus] = useState<Focus | null>(null);
  const groups = useMemo(() => {
    const out: { domain: DomainCode; rows: MatrixRow[] }[] = [];
    for (const r of rows) {
      const last = out[out.length - 1];
      if (last && last.domain === r.domain) last.rows.push(r);
      else out.push({ domain: r.domain, rows: [r] });
    }
    return out;
  }, [rows]);

  const activeAction = focus && focus.kind !== "row" ? focus.action : null;
  const activeRow = focus && focus.kind !== "action" ? focus.row : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="z-20 md:sticky md:top-14 lg:top-0">
        <div className="bg-white/95 pb-2 pt-1 backdrop-blur">
          <InfoPanel focus={focus} rows={rows} />
          <Legend />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white p-3 shadow-dmi-sm">
        <table className="border-separate" style={{ borderSpacing: 2 }} onMouseLeave={() => setFocus(null)}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white" />
              {actions.map((a, i) => {
                const on = activeAction?.id === a.id;
                return (
                  <th
                    key={a.id}
                    scope="col"
                    className={cn("p-0 align-bottom", i > 0 && actions[i - 1].actielijn !== a.actielijn && "pl-2")}
                  >
                    <Link
                      href={`/blauwdruk/${a.slug}`}
                      onMouseEnter={() => setFocus({ kind: "action", action: a })}
                      onFocus={() => setFocus({ kind: "action", action: a })}
                      aria-label={`Actie ${a.id}`}
                      className={cn(
                        "dmi-tag block h-14 rotate-180 whitespace-nowrap rounded-sm px-px text-[9px] text-muted-foreground [writing-mode:vertical-rl] hover:text-dmi-navy",
                        a.best !== "goed" && "text-[#8a3f17]",
                        on && "bg-dmi-gold/40 text-dmi-navy"
                      )}
                    >
                      {a.id}
                      {a.best !== "goed" && " ⚠"}
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <MatrixGroup
                key={g.domain}
                group={g}
                actions={actions}
                activeAction={activeAction}
                activeRow={activeRow}
                setFocus={setFocus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoPanel({ focus, rows }: { focus: Focus | null; rows: MatrixRow[] }) {
  if (!focus) {
    return (
      <div className="flex h-56 items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-dmi-blue-050 p-4 text-sm text-muted-foreground">
        <MousePointer2 className="size-4" />
        Wijs een actie (kolom), een monitoringsvraag (rij) of een cel aan. Klik om de pagina te openen.
      </div>
    );
  }
  const action = focus.kind !== "row" ? focus.action : null;
  const row = focus.kind !== "action" ? focus.row : null;
  const linkedRows = action && !row ? rows.filter((r) => r.codes.includes(action.id)) : [];

  return (
    <div className="grid h-56 gap-3 md:grid-cols-2" aria-live="polite">
      <div className="flex min-h-0 flex-col rounded-xl border border-border bg-white p-4 shadow-dmi-sm">
        {action ? (
          <>
            <p className="dmi-tag text-[10px] text-[#7a5410]">
              Actie {action.id} · actielijn {action.actielijn} · {actielijnen[action.actielijn].title}
            </p>
            <p className="mt-1 min-h-0 overflow-y-auto text-sm leading-relaxed text-dmi-navy">{action.text}</p>
          </>
        ) : (
          <p className="m-auto text-center text-sm text-muted-foreground">
            Wijs een cel of kolom aan om de G40-actie te zien.
          </p>
        )}
      </div>

      <div className="flex min-h-0 flex-col rounded-xl border border-border bg-white p-4 shadow-dmi-sm">
        {row ? (
          <>
            <p className="dmi-tag text-[10px] text-dmi-blue">
              Monitoringsvraag {row.id} · {row.indicators.length} indicatoren
            </p>
            <p className="font-medium text-dmi-navy">{row.title}</p>
            <ul className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {[...row.indicators]
                .sort((a, b) => registerGeschiktheid.indexOf(a.geschiktheid) - registerGeschiktheid.indexOf(b.geschiktheid))
                .map((i) => (
                  <li key={i.slug} className="flex items-center gap-2 text-xs">
                    <span className="dmi-tag w-16 shrink-0 text-[10px] text-muted-foreground">{i.code}</span>
                    <span className="min-w-0 flex-1 truncate text-dmi-navy">{i.name}</span>
                    <GeschiktheidBadge value={i.geschiktheid} />
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <>
            <p className="dmi-tag text-[10px] text-dmi-blue">
              {linkedRows.length} gekoppelde monitoringsvragen
            </p>
            <ul className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {linkedRows.map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-xs">
                  <span className="dmi-tag w-12 shrink-0 text-[10px] text-dmi-blue">{r.id}</span>
                  <span className="min-w-0 flex-1 truncate text-dmi-navy">{r.title}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">{r.indicators.length}</span>
                  {r.best && <GeschiktheidBadge value={r.best} />}
                </li>
              ))}
              {linkedRows.length === 0 && <li className="text-xs text-muted-foreground">Geen gekoppelde vragen.</li>}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <ul className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
      {registerGeschiktheid.map((g) => (
        <li key={g} className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px]" style={{ backgroundColor: geschiktheidColors[g] }} />
          Beste indicator: {geschiktheidLabels[g]}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="size-3 rounded-[3px] bg-dmi-gray-100" /> Geen koppeling
      </li>
      <li className="flex items-center gap-1.5">
        <span className="text-[#8a3f17]">⚠</span> Actie zonder geschikte indicator
      </li>
    </ul>
  );
}

function MatrixGroup({
  group,
  actions,
  activeAction,
  activeRow,
  setFocus,
}: {
  group: { domain: DomainCode; rows: MatrixRow[] };
  actions: MatrixAction[];
  activeAction: MatrixAction | null;
  activeRow: MatrixRow | null;
  setFocus: (f: Focus | null) => void;
}) {
  return (
    <>
      <tr>
        <th
          colSpan={actions.length + 1}
          scope="rowgroup"
          className="sticky left-0 bg-white pb-1 pt-3 text-left font-heading text-xs font-semibold text-dmi-navy"
        >
          {group.domain}. {domains[group.domain].label}
        </th>
      </tr>
      {group.rows.map((r) => {
        const rowOn = activeRow?.id === r.id;
        return (
          <tr key={r.id}>
            <th
              scope="row"
              className={cn(
                "sticky left-0 z-10 max-w-[11rem] bg-white pr-2 text-left text-[11px] font-normal",
                rowOn ? "text-dmi-navy" : "text-muted-foreground"
              )}
            >
              <Link
                href={`/vragen/${r.slug}`}
                className={cn("block truncate rounded-sm px-1 hover:underline", rowOn && "bg-dmi-blue-100")}
                onMouseEnter={() => setFocus({ kind: "row", row: r })}
                onFocus={() => setFocus({ kind: "row", row: r })}
              >
                <span className="dmi-tag mr-1 text-[9px]">{r.id}</span>
                {r.title}
              </Link>
            </th>
            {actions.map((a, i) => {
              const linked = r.codes.includes(a.id);
              const style = linked && r.best ? { backgroundColor: geschiktheidColors[r.best] } : undefined;
              const lit = rowOn || activeAction?.id === a.id;
              return (
                <td key={a.id} className={cn("p-0", i > 0 && actions[i - 1].actielijn !== a.actielijn && "pl-2")}>
                  {linked ? (
                    <Link
                      href={`/vragen/${r.slug}`}
                      aria-label={`${r.id} ${r.title} – actie ${a.id}`}
                      onMouseEnter={() => setFocus({ kind: "cell", row: r, action: a })}
                      onFocus={() => setFocus({ kind: "cell", row: r, action: a })}
                      className={cn(
                        "block rounded-[3px] ring-offset-1 hover:ring-2 hover:ring-dmi-navy focus-visible:ring-2 focus-visible:ring-dmi-navy",
                        !r.best && "bg-dmi-blue-200"
                      )}
                      style={{ width: CELL, height: CELL, ...style }}
                    />
                  ) : (
                    <span
                      className={cn("block rounded-[3px]", lit ? "bg-dmi-blue-100" : "bg-dmi-gray-100/70")}
                      style={{ width: CELL, height: CELL }}
                      onMouseEnter={() => setFocus({ kind: "cell", row: r, action: a })}
                    />
                  )}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}
