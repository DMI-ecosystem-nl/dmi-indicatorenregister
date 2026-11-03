"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, HelpCircle, Landmark, Search } from "lucide-react";
import type { SearchItem } from "@/lib/search-index";
import { Button } from "./ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from "./ui/command";

const GROUPS: { kind: SearchItem["kind"]; label: string; icon: typeof Search }[] = [
  { kind: "indicator", label: "Indicatoren", icon: BarChart3 },
  { kind: "vraag", label: "Monitoringsvragen", icon: HelpCircle },
  { kind: "actie", label: "Blauwdruk G40-acties", icon: Landmark },
];

export function CommandSearch({
  items,
  listen = false,
  variant = "sidebar",
}: {
  items: SearchItem[];
  /** Only one instance should own the ⌘K shortcut. */
  listen?: boolean;
  variant?: "sidebar" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!listen) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listen]);

  return (
    <>
      {variant === "icon" ? (
        <Button variant="outline" size="icon" onClick={() => setOpen(true)} aria-label="Zoeken">
          <Search className="size-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="h-9 w-full justify-start gap-2 text-muted-foreground"
        >
          <Search className="size-4" />
          <span>Zoek in het register…</span>
          <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
        </Button>
      )}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Zoeken"
        description="Zoek indicatoren, monitoringsvragen en G40-acties"
        className="top-1/2 -translate-y-1/2 sm:max-w-xl"
      >
        <Command>
          <CommandInput placeholder="Zoek op indicator, vraag, bron of code…" />
          <CommandList className="max-h-[min(50vh,26rem)]">
            <CommandEmpty>Geen resultaten.</CommandEmpty>
            {GROUPS.map((g) => (
              <CommandGroup key={g.kind} heading={g.label}>
                {items
                  .filter((i) => i.kind === g.kind)
                  .map((item) => (
                    <CommandItem
                      key={item.href}
                      value={`${item.code} ${item.title} ${item.sub}`}
                      onSelect={() => {
                        setOpen(false);
                        router.push(item.href);
                      }}
                    >
                      <g.icon className="text-dmi-blue" />
                      <span className="dmi-tag w-16 shrink-0 text-[10px] text-muted-foreground">{item.code}</span>
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
