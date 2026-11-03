"use client";

import Link from "next/link";
import { useState } from "react";
import { domains, geschiktheidColors, geschiktheidLabels } from "@/data/taxonomy";
import type { Actielijn, DomainCode, Geschiktheid } from "@/data/types";
import { cn } from "@/lib/utils";

export interface MatrixAction {
  id: string;
  slug: string;
  actielijn: Actielijn;
  text: string;
  best: Geschiktheid | null;
}
export interface MatrixRow {
  id: string;
  slug: string;
  title: string;
  domain: DomainCode;
  best: Geschiktheid | null;
  codes: string[];
  register: number;
  total: number;
}

const CELL = 14;

export function BlueprintMatrix({ actions, rows }: { actions: MatrixAction[]; rows: MatrixRow[] }) {
  const [hover, setHover] = useState<{ row: MatrixRow; action: MatrixAction | null } | null>(null);
  const groups: { domain: DomainCode; rows: MatrixRow[] }[] = [];
  for (const r of rows) {
    const last = groups[groups.length - 1];
    if (last && last.domain === r.domain) last.rows.push(r);
    else groups.push({ domain: r.domain, rows: [r] });
  }

  return (
    <div className="flex flex-col gap-4">
      <aside className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="min-h-28 rounded-xl border border-border bg-white p-4 text-sm shadow-dmi-sm" aria-live="polite">
          {hover ? (
            <>
              <p className="dmi-tag text-[10px] text-dmi-blue">{hover.row.id}</p>
              <p className="font-medium text-dmi-navy">{hover.row.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {hover.row.register} van {hover.row.total} indicatoren in register
                {hover.row.best && <> · beste: {geschiktheidLabels[hover.row.best]}</>}
              </p>
              {hover.action && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="dmi-tag text-[10px] text-[#7a5410]">Actie {hover.action.id}</p>
                  <p className="line-clamp-5 text-xs text-foreground/80">{hover.action.text}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">
              Beweeg over een cel om de monitoringsvraag en G40-actie te zien. Klik om de vraag te openen.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-white p-4 text-xs text-muted-foreground shadow-dmi-sm">
          <p className="mb-2 font-medium text-dmi-navy">Legenda</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {(["goed", "gewenst", "beperkt", "niet"] as Geschiktheid[]).map((g) => (
              <li key={g} className="flex items-center gap-2">
                <span className="size-3 rounded-[3px]" style={{ backgroundColor: geschiktheidColors[g] }} />
                Beste indicator: {geschiktheidLabels[g]}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-[3px] bg-dmi-gray-100" /> Geen koppeling
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 text-center text-[#8a3f17]">⚠</span> Actie zonder ‘Goed’ indicator
            </li>
          </ul>
        </div>
      </aside>
      <div className="overflow-x-auto rounded-xl border border-border bg-white p-3 shadow-dmi-sm">
        <table className="border-separate" style={{ borderSpacing: 2 }} onMouseLeave={() => setHover(null)}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white" />
              {actions.map((a, i) => (
                <th
                  key={a.id}
                  scope="col"
                  className={cn("p-0 align-bottom", i > 0 && actions[i - 1].actielijn !== a.actielijn && "pl-2")}
                >
                  <Link
                    href={`/blauwdruk/${a.slug}`}
                    className={cn(
                      "dmi-tag block h-14 whitespace-nowrap text-[9px] text-muted-foreground [writing-mode:vertical-rl] rotate-180 hover:text-dmi-navy",
                      a.best !== "goed" && "text-[#8a3f17]"
                    )}
                    title={a.best === "goed" ? a.text : `Geen 'Goed' indicator · ${a.text}`}
                  >
                    {a.id}
                    {a.best !== "goed" && " ⚠"}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <MatrixGroup key={g.domain} group={g} actions={actions} hover={hover} setHover={setHover} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatrixGroup({
  group,
  actions,
  hover,
  setHover,
}: {
  group: { domain: DomainCode; rows: MatrixRow[] };
  actions: MatrixAction[];
  hover: { row: MatrixRow; action: MatrixAction | null } | null;
  setHover: (h: { row: MatrixRow; action: MatrixAction | null } | null) => void;
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
      {group.rows.map((r) => (
        <tr key={r.id}>
          <th
            scope="row"
            className={cn(
              "sticky left-0 z-10 max-w-[13rem] bg-white pr-2 text-left text-[11px] font-normal",
              hover?.row.id === r.id ? "text-dmi-navy" : "text-muted-foreground"
            )}
          >
            <Link href={`/vragen/${r.slug}`} className="block truncate hover:underline" onMouseEnter={() => setHover({ row: r, action: null })}>
              <span className="dmi-tag mr-1 text-[9px]">{r.id}</span>
              {r.title}
            </Link>
          </th>
          {actions.map((a, i) => {
            const linked = r.codes.includes(a.id);
            const style = linked && r.best ? { backgroundColor: geschiktheidColors[r.best] } : undefined;
            const active = hover?.row.id === r.id || hover?.action?.id === a.id;
            return (
              <td key={a.id} className={cn("p-0", i > 0 && actions[i - 1].actielijn !== a.actielijn && "pl-2")}>
                {linked ? (
                  <Link
                    href={`/vragen/${r.slug}`}
                    aria-label={`${r.id} ${r.title} – actie ${a.id}`}
                    onMouseEnter={() => setHover({ row: r, action: a })}
                    onFocus={() => setHover({ row: r, action: a })}
                    className={cn("block rounded-[3px] ring-offset-1 hover:ring-2 hover:ring-dmi-navy focus-visible:ring-2 focus-visible:ring-dmi-navy", !r.best && "bg-dmi-blue-200")}
                    style={{ width: CELL, height: CELL, ...style }}
                  />
                ) : (
                  <span
                    className={cn("block rounded-[3px]", active ? "bg-dmi-blue-100" : "bg-dmi-gray-100/70")}
                    style={{ width: CELL, height: CELL }}
                    onMouseEnter={() => setHover({ row: r, action: a })}
                  />
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
