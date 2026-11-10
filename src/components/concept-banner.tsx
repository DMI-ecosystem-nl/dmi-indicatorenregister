import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { meta } from "@/lib/selectors";

export function ConceptBanner() {
  return (
    <div className="bg-dmi-navy text-white lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-1.5 text-xs sm:px-6 lg:px-8">
        <FlaskConical className="size-3.5 shrink-0 text-dmi-gold" aria-hidden />
        <p className="min-w-0 truncate">
          <span className="font-semibold text-dmi-gold">Concept v{meta.version}</span>
          <span className="text-white/80">
            {" "}
            · werkbaar concept, in toetsing bij de DMI Indicatoren community · versie 1.0 op 2 december 2026
          </span>
        </p>
        <Link href="/over" className="ml-auto shrink-0 underline-offset-2 hover:underline text-white/90">
          Meer informatie
        </Link>
      </div>
    </div>
  );
}
