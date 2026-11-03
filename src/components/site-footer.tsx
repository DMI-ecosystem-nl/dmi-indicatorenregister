import Link from "next/link";
import { formatDate } from "@/lib/format";
import { meta } from "@/lib/selectors";

const LINKS = [
  { href: "/domeinen", label: "Domeinen" },
  { href: "/blauwdruk", label: "Blauwdruk G40" },
  { href: "/vragen", label: "Monitoringsvragen" },
  { href: "/indicatoren", label: "Indicatoren" },
  { href: "/ecosysteem", label: "Ecosysteem & PDX" },
  { href: "/methodiek", label: "Proces & methodiek" },
  { href: "/user-stories", label: "User stories" },
  { href: "/over", label: "Over" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-dmi-blue-050">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_2fr] lg:px-8">
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dmi-logo.svg" alt="DMI Ecosysteem" className="h-9" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Indicatorenregister voor slimme duurzame verstedelijking en mobiliteitsvernieuwing.
            Concept v{meta.pdfVersion} ({formatDate(meta.pdfDate)}).
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-dmi-navy hover:text-dmi-blue hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-border/70">
        <p className="mx-auto max-w-7xl px-4 py-3 text-[11px] text-muted-foreground sm:px-6 lg:px-8">
          DMI Ecosysteem · Ministerie van BZK · Inhoud is een werkbaar concept en kan wijzigen.
        </p>
      </div>
    </footer>
  );
}
