import Link from "next/link";
import { schaalLabels } from "@/data/taxonomy";
import type { Indicator } from "@/data/types";
import { schaalOf } from "@/lib/selectors";
import { GeschiktheidBadge } from "./geschiktheid-badge";

export function IndicatorTable({ items, backQuery }: { items: Indicator[]; backQuery?: string }) {
  const suffix = backQuery ? `?terug=${encodeURIComponent(backQuery)}` : "";
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-dmi-sm">
      <table className="w-full min-w-[860px] text-sm">
        <thead className="bg-dmi-blue-050 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Code</th>
            <th className="px-3 py-2 font-medium">Indicator</th>
            <th className="px-3 py-2 font-medium">Vraag</th>
            <th className="px-3 py-2 font-medium">Domein</th>
            <th className="px-3 py-2 font-medium">Bron</th>
            <th className="px-3 py-2 font-medium">Schaal</th>
            <th className="px-3 py-2 font-medium">Frequentie</th>
            <th className="px-3 py-2 font-medium text-right">Jaar</th>
            <th className="px-3 py-2 font-medium">Geschiktheid</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((i) => (
            <tr key={i.slug} className="hover:bg-dmi-blue-050/60">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-muted-foreground">
                {i.indeling ?? i.id}
              </td>
              <td className="px-3 py-2">
                <Link href={`/indicatoren/${i.slug}${suffix}`} className="font-medium text-dmi-navy hover:text-dmi-blue hover:underline">
                  {i.name}
                </Link>
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-muted-foreground">{i.vraagId}</td>
              <td className="px-3 py-2 font-mono text-[11px] text-dmi-navy">{i.domain}</td>
              <td className="px-3 py-2 text-xs">{i.bron ?? "—"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-xs">{schaalLabels[schaalOf(i)]}</td>
              <td className="px-3 py-2 text-xs">{i.frequentie ?? "—"}</td>
              <td className="px-3 py-2 text-right text-xs tabular-nums">{i.meestRecentJaar ?? "—"}</td>
              <td className="px-3 py-2">
                <GeschiktheidBadge value={i.geschiktheid} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
