"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cptGrid, cptGroups, userStories, type CptGroup } from "@/data/content/cpt";
import { cn } from "@/lib/utils";

export function CptExplorer() {
  const [active, setActive] = useState<string | null>("US-1");
  const story = userStories.find((s) => s.id === active) ?? null;
  const used = new Set(story ? story.rows.map((r) => r.capability) : []);
  const usage = new Map<string, number>();
  for (const s of userStories) for (const c of new Set(s.rows.map((r) => r.capability))) usage.set(c, (usage.get(c) ?? 0) + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="User stories">
        <button
          type="button"
          role="tab"
          aria-selected={active === null}
          onClick={() => setActive(null)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium",
            active === null ? "border-dmi-navy bg-dmi-navy text-white" : "border-border bg-white text-dmi-navy hover:bg-dmi-blue-050"
          )}
        >
          Alle stories (gebruik)
        </button>
        {userStories.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={active === s.id}
            onClick={() => setActive(s.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              active === s.id ? "border-dmi-navy bg-dmi-navy text-white" : "border-border bg-white text-dmi-navy hover:bg-dmi-blue-050"
            )}
          >
            <span className="dmi-tag mr-1">{s.id}</span> {s.title}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-white p-3 shadow-dmi-sm">
        <div className="grid min-w-[880px] grid-cols-8 gap-1.5">
          {cptGrid.flatMap((row, r) =>
            row.map((cell, c) => {
              if (!cell) return <div key={`${r}-${c}`} />;
              const [code, name] = cell;
              const g = cptGroups[code.slice(0, 2) as CptGroup];
              const on = story ? used.has(code) : (usage.get(code) ?? 0) > 0;
              const count = usage.get(code) ?? 0;
              return (
                <motion.div
                  key={code}
                  layout
                  animate={{ opacity: on ? 1 : 0.38, scale: on && story ? 1.03 : 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn("relative rounded-lg border px-2 py-1.5 text-center", on && "shadow-dmi-sm")}
                  style={{
                    backgroundColor: g.bg,
                    borderColor: on ? "#19365d" : g.border,
                    borderWidth: on ? 2 : 1,
                  }}
                  title={`${code} · ${name}`}
                >
                  <p className="text-[11px] font-bold text-dmi-navy">{code}</p>
                  <p className="text-[10px] leading-tight text-foreground/80">{name}</p>
                  {!story && count > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-dmi-gold text-[10px] font-bold text-dmi-navy">
                      {count}
                    </span>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
        <ul className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          {Object.entries(cptGroups).map(([k, g]) => (
            <li key={k} className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full border" style={{ backgroundColor: g.bg, borderColor: g.border }} /> {g.label}
            </li>
          ))}
        </ul>
      </div>

      {story ? (
        <div className="rounded-2xl border border-border bg-white shadow-dmi-sm">
          <div className="border-b border-border p-4">
            <p className="dmi-tag text-[11px] text-dmi-blue">{story.id}</p>
            <h3 className="font-heading text-lg font-semibold text-dmi-navy">{story.title}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {story.blocks.map((b) => (
                <span key={b} className="rounded-md bg-dmi-blue-100 px-2 py-0.5 text-xs text-dmi-navy">{b}</span>
              ))}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-dmi-blue-050 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Beleidsbouwblok</th>
                <th className="px-4 py-2 font-medium">Capability</th>
                <th className="px-4 py-2 font-medium">Rol binnen DMI-dashboard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {story.rows.map((r) => (
                <tr key={`${r.block}-${r.capability}`}>
                  <td className="px-4 py-2">{r.block}</td>
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-dmi-navy">{r.capability}</td>
                  <td className="px-4 py-2 text-foreground/90">{r.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Het getal op een capability geeft aan in hoeveel van de zeven user stories die capability terugkomt.
        </p>
      )}
    </div>
  );
}
