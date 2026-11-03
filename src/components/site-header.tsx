import Link from "next/link";
import { buildSearchIndex } from "@/lib/search-index";
import { CommandSearch } from "./command-search";
import { HeaderNav, MobileNav } from "./header-nav";

export function SiteHeader() {
  const index = buildSearchIndex();
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dmi-logo.svg" alt="DMI Ecosysteem" className="h-8 shrink-0" />
          <span className="h-6 w-px shrink-0 bg-border max-[420px]:hidden" />
          <span className="truncate font-heading text-sm font-semibold text-dmi-navy max-[420px]:hidden">
            Indicatorenregister
          </span>
        </Link>
        <HeaderNav />
        <div className="ml-auto flex items-center gap-1">
          <CommandSearch items={index} />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
