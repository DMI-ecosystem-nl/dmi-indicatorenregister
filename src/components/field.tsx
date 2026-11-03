import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const empty = children === null || children === undefined || children === "";
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="dmi-tag text-[10px] text-muted-foreground">{label}</dt>
      <dd className={cn("mt-1 text-sm text-dmi-navy", empty && "text-muted-foreground/70")}>
        {empty ? "Niet bekend" : children}
      </dd>
    </div>
  );
}

export function Prose({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n").filter((l) => l.trim());
  return (
    <div className={cn("space-y-1.5 text-sm leading-relaxed text-foreground/90", className)}>
      {lines.map((l, i) => (
        <p key={i}>{l}</p>
      ))}
    </div>
  );
}

/** Newline-separated source text rendered as a compact bullet list. */
export function LineList({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n").map((l) => l.replace(/^[-•·]\s*/, "").trim()).filter(Boolean);
  if (lines.length <= 1) return <Prose text={text} className={className} />;
  return (
    <ul className={cn("space-y-1 text-sm text-foreground/90", className)}>
      {lines.map((l, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-2 size-1 shrink-0 rounded-full bg-dmi-gold" />
          <span>{l}</span>
        </li>
      ))}
    </ul>
  );
}
