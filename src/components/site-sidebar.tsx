import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { domainOrder, domains } from "@/data/taxonomy";
import { meta, totals } from "@/lib/selectors";
import { buildSearchIndex } from "@/lib/search-index";
import { CommandSearch } from "./command-search";
import { FeedbackDialog } from "./feedback-dialog";
import { MobileMenu } from "./mobile-menu";
import { SidebarNav, type SidebarData } from "./sidebar-nav";

function sidebarData(): SidebarData {
  return {
    counts: {
      domains: totals.domains,
      actions: totals.actions,
      questions: totals.questions,
      indicators: totals.indicators,
    },
    domains: domainOrder.map((c) => ({ code: c, slug: domains[c].slug, short: domains[c].short })),
  };
}

function Brand() {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/dmi-logo.svg" alt="DMI Ecosysteem" className="h-8 shrink-0" />
      <span className="h-6 w-px shrink-0 bg-border max-[400px]:hidden" />
      <span className="truncate font-heading text-sm font-semibold text-dmi-navy max-[400px]:hidden">
        Indicatorenregister
      </span>
    </Link>
  );
}

function ConceptCard() {
  return (
    <Link
      href="/over"
      className="block rounded-xl bg-dmi-navy p-3 text-xs text-white/85 transition-colors hover:bg-dmi-blue"
    >
      <span className="flex items-center gap-1.5 font-semibold text-dmi-gold">
        <FlaskConical className="size-3.5" /> Concept v{meta.version}
      </span>
      <span className="mt-1 block leading-relaxed">
        Werkbaar concept, in toetsing bij de DMI Indicatoren community. Versie 1.0 komt op 2 december 2026.
      </span>
    </Link>
  );
}

/** Desktop: fixed left sidebar. Mobile: top bar with search and a menu panel. */
export function SiteSidebar() {
  const data = sidebarData();
  const index = buildSearchIndex();
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-white lg:flex">
        <Link href="/" className="block border-b border-border px-5 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dmi-logo.svg" alt="DMI Ecosysteem" className="h-8" />
          <span className="mt-1.5 block font-heading text-base font-semibold text-dmi-navy">Indicatorenregister</span>
        </Link>
        <div className="px-3 pt-4">
          <CommandSearch items={index} listen variant="sidebar" />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <SidebarNav data={data} />
        </div>
        <div className="space-y-3 border-t border-border p-3">
          <FeedbackDialog variant="sidebar" />
          <ConceptCard />
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center gap-2 px-4">
          <Brand />
          <div className="ml-auto flex items-center gap-1">
            <CommandSearch items={index} variant="icon" />
            <FeedbackDialog variant="icon" />
            <MobileMenu data={data}>
              <ConceptCard />
            </MobileMenu>
          </div>
        </div>
      </header>
    </>
  );
}
