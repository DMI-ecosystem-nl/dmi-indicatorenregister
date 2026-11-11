import { geschiktheidColors, geschiktheidLabels, registerGeschiktheid } from "@/data/taxonomy";
import type { RegisterGeschiktheid as Geschiktheid } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * Stacked geschiktheid bar: thin, rounded ends, 2px surface gaps between
 * segments. Each segment carries a native tooltip with label + count.
 */
export function CoverageBar({
  counts,
  total,
  className,
  height = 8,
  include = registerGeschiktheid,
}: {
  counts: Record<Geschiktheid, number>;
  total?: number;
  className?: string;
  height?: number;
  include?: Geschiktheid[];
}) {
  const sum = total ?? include.reduce((s, g) => s + counts[g], 0);
  if (!sum) return <div className={cn("rounded-full bg-muted", className)} style={{ height }} />;
  return (
    <div
      className={cn("flex w-full gap-[2px] overflow-hidden rounded-full", className)}
      style={{ height }}
      role="img"
      aria-label={include.map((g) => `${geschiktheidLabels[g]}: ${counts[g]}`).join(", ")}
    >
      {include
        .filter((g) => counts[g] > 0)
        .map((g) => (
          <div
            key={g}
            title={`${geschiktheidLabels[g]}: ${counts[g]}`}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(counts[g] / sum) * 100}%`, backgroundColor: geschiktheidColors[g] }}
          />
        ))}
    </div>
  );
}

export function CoverageLegend({
  counts,
  include = registerGeschiktheid,
  className,
}: {
  counts?: Record<Geschiktheid, number>;
  include?: Geschiktheid[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground", className)}>
      {include.map((g) => (
        <li key={g} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: geschiktheidColors[g] }} />
          <span className="text-foreground">{geschiktheidLabels[g]}</span>
          {counts && <span className="tabular-nums">{counts[g]}</span>}
        </li>
      ))}
    </ul>
  );
}
