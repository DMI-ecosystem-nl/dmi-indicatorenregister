"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Grid3x3,
  HelpCircle,
  Home,
  Info,
  Landmark,
  LayoutGrid,
  Network,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { DomainCode } from "@/data/types";
import { cn } from "@/lib/utils";
import { DomainIcon } from "./domain-icon";
import { isActive, navGroups, type NavCount, type NavIcon } from "./nav-items";

const ICONS: Record<NavIcon, LucideIcon> = {
  home: Home,
  "layout-grid": LayoutGrid,
  landmark: Landmark,
  "help-circle": HelpCircle,
  "bar-chart": BarChart3,
  grid: Grid3x3,
  network: Network,
  workflow: Workflow,
  boxes: Boxes,
  info: Info,
};

export interface SidebarData {
  counts: Record<NavCount, number>;
  domains: { code: DomainCode; slug: string; short: string }[];
}

export function SidebarNav({ data, onNavigate }: { data: SidebarData; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Hoofdnavigatie" className="space-y-5">
      {navGroups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className="dmi-tag mb-1.5 px-3 text-[10px] text-muted-foreground">{group.label}</p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = ICONS[item.icon];
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-dmi-navy/80 transition-colors hover:bg-dmi-blue-050 hover:text-dmi-navy",
                      active && "bg-dmi-blue-100 font-medium text-dmi-navy"
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0 text-dmi-blue/70", active && "text-dmi-navy")} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.count && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[11px] tabular-nums text-muted-foreground",
                          active ? "bg-white" : "bg-dmi-gray-100"
                        )}
                      >
                        {data.counts[item.count]}
                      </span>
                    )}
                  </Link>
                  {item.href === "/domeinen" && pathname.startsWith("/domeinen") && (
                    <ul className="mb-1 ml-5 mt-0.5 space-y-0.5 border-l border-border pl-2">
                      {data.domains.map((d) => {
                        const href = `/domeinen/${d.slug}`;
                        const on = pathname === href;
                        return (
                          <li key={d.code}>
                            <Link
                              href={href}
                              onClick={onNavigate}
                              aria-current={on ? "page" : undefined}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground hover:bg-dmi-blue-050 hover:text-dmi-navy",
                                on && "bg-dmi-blue-050 font-medium text-dmi-navy"
                              )}
                            >
                              <DomainIcon code={d.code} className="size-3.5 shrink-0" />
                              <span className="truncate">{d.short}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
