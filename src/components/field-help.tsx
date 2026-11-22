"use client";

import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** Info icon next to a field label; opens on hover, focus or tap. */
export function FieldHelp({ label, text }: { label: string; text: string }) {
  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={150}
        aria-label={`Uitleg: ${label}`}
        className="-m-1 inline-flex rounded p-1 text-muted-foreground/70 hover:text-dmi-blue focus-visible:text-dmi-blue focus-visible:outline-2 focus-visible:outline-dmi-blue"
      >
        <Info className="size-3" aria-hidden />
      </PopoverTrigger>
      <PopoverContent side="top" className="w-64 text-xs leading-relaxed">
        {text}
      </PopoverContent>
    </Popover>
  );
}
