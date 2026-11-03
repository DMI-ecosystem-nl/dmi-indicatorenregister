import { CircleCheck, CircleDashed, CircleMinus, CircleX } from "lucide-react";
import { geschiktheidBadge, geschiktheidLabels } from "@/data/taxonomy";
import type { Geschiktheid } from "@/data/types";
import { cn } from "@/lib/utils";

const ICONS = {
  goed: CircleCheck,
  gewenst: CircleDashed,
  beperkt: CircleMinus,
  niet: CircleX,
} as const;

/** Assessment badge — always icon + label, never colour alone. */
export function GeschiktheidBadge({
  value,
  className,
  size = "sm",
}: {
  value: Geschiktheid;
  className?: string;
  size?: "sm" | "md";
}) {
  const Icon = ICONS[value];
  const { bg, fg } = geschiktheidBadge[value];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "h-5 px-2 text-[11px]" : "h-6 px-2.5 text-xs",
        className
      )}
      style={{ backgroundColor: bg, color: fg }}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden />
      {geschiktheidLabels[value]}
    </span>
  );
}
