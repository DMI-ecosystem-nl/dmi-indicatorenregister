"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "./ui/select";

/** Shared building blocks for the filter toolbars (catalogue, vragen). */

export function Toolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-white p-3 shadow-dmi-sm", className)}>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className="relative flex min-w-[min(100%,18rem)] flex-1 items-center">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border bg-dmi-blue-050/60 pl-9 pr-9 text-sm text-dmi-navy outline-none placeholder:text-muted-foreground focus-visible:border-dmi-blue focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Zoekterm wissen"
          className="absolute right-2 rounded p-1 text-muted-foreground hover:bg-dmi-blue-100 hover:text-dmi-navy"
        >
          <X className="size-4" />
        </button>
      )}
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: T;
  options: { value: T; label: React.ReactNode }[];
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex h-10 shrink-0 rounded-lg border border-border bg-dmi-blue-050/60 p-1", className)}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-dmi-navy",
            value === o.value && "bg-white text-dmi-navy shadow-dmi-sm"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function FacetSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (v: T | null) => void;
  className?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange((v as T | null) ?? null)}
      items={options}
    >
      <SelectTrigger
        aria-label={label}
        className={cn(
          "h-9 w-full min-w-0 bg-white pl-3 pr-2.5 shadow-none",
          value
            ? "border-dmi-blue bg-dmi-blue-100 font-medium text-dmi-navy"
            : "border-border text-muted-foreground hover:border-dmi-blue-200",
          className
        )}
      >
        <SelectValue placeholder={label} className="min-w-0 truncate" />
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        align="start"
        className="w-auto min-w-(--anchor-width) max-w-[min(24rem,calc(100vw-2rem))] p-1 shadow-dmi-lg"
      >
        <p className="dmi-tag px-2 pb-1 pt-1.5 text-[10px] text-muted-foreground">{label}</p>
        {value !== null && (
          <>
            <SelectItem value={null} className="py-1.5 text-dmi-blue">
              Geen filter
            </SelectItem>
            <SelectSeparator />
          </>
        )}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="py-1.5 pl-2 text-dmi-navy">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Multi-select toggle group (e.g. geschiktheid). */
export function ToggleGroup<T extends string>({
  label,
  values,
  options,
  onToggle,
}: {
  label: string;
  values: T[];
  options: { value: T; label: React.ReactNode; dot?: string }[];
  onToggle: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex h-10 w-full shrink-0 overflow-hidden rounded-lg border border-border bg-white lg:inline-flex lg:w-auto">
      {options.map((o, i) => {
        const on = values.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(o.value)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 px-2 text-sm transition-colors sm:px-3",
              i > 0 && "border-l border-border",
              on ? "bg-dmi-navy font-medium text-white" : "text-dmi-navy hover:bg-dmi-blue-050"
            )}
          >
            {o.dot && <span className="size-2 rounded-full ring-1 ring-white/70" style={{ backgroundColor: o.dot }} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function FilterRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {children}
    </div>
  );
}

export interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

/** Result count, removable chips for active filters, and an optional right-hand slot. */
export function StatusBar({
  count,
  noun,
  active,
  onClear,
  children,
}: {
  count: number;
  noun: [string, string];
  active: ActiveFilter[];
  onClear: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
      <p className="mr-1 text-sm text-dmi-navy" aria-live="polite">
        <strong className="tabular-nums">{count}</strong> {count === 1 ? noun[0] : noun[1]}
      </p>
      {active.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={f.onRemove}
          className="group inline-flex h-7 max-w-[16rem] items-center gap-1 rounded-full bg-dmi-blue-100 pl-2.5 pr-1.5 text-xs text-dmi-navy hover:bg-dmi-blue-200"
          aria-label={`Filter verwijderen: ${f.label}`}
        >
          <span className="truncate">{f.label}</span>
          <X className="size-3.5 shrink-0 text-dmi-navy/60 group-hover:text-dmi-navy" />
        </button>
      ))}
      {active.length > 1 && (
        <button type="button" onClick={onClear} className="text-xs font-medium text-dmi-blue hover:underline">
          Wis alles
        </button>
      )}
      {children && <div className="ml-auto">{children}</div>}
    </div>
  );
}
