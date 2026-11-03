"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { primaryNav, secondaryNav } from "./nav-items";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

function isActive(pathname: string, href: string) {
  if (href === "/blauwdruk") return pathname === "/blauwdruk" || /^\/blauwdruk\/(?!matrix)/.test(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav() {
  const pathname = usePathname();
  const moreActive = secondaryNav.some((n) => isActive(pathname, n.href));
  return (
    <nav aria-label="Hoofdnavigatie" className="ml-4 hidden items-center gap-0.5 lg:flex">
      {primaryNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "relative rounded-md px-3 py-1.5 text-sm text-dmi-navy/80 transition-colors hover:bg-dmi-blue-050 hover:text-dmi-navy",
            isActive(pathname, item.href) && "font-medium text-dmi-navy after:absolute after:inset-x-3 after:-bottom-[11px] after:h-0.5 after:rounded-full after:bg-dmi-gold"
          )}
        >
          {item.label}
        </Link>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-dmi-navy/80 hover:bg-dmi-blue-050 hover:text-dmi-navy",
                moreActive && "font-medium text-dmi-navy"
              )}
            />
          }
        >
          Meer <ChevronDown className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          {secondaryNav.map((item) => (
            <DropdownMenuItem
              key={item.href}
              render={<Link href={item.href} />}
              className="flex flex-col items-start gap-0 py-2"
            >
              <span className="font-medium text-dmi-navy">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu openen" />}
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="font-heading text-dmi-navy">Indicatorenregister</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 pb-6" aria-label="Mobiele navigatie">
          {[...primaryNav, ...secondaryNav].map((item, idx) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-dmi-navy hover:bg-dmi-blue-050",
                idx === primaryNav.length && "mt-3 border-t border-border pt-4",
                isActive(pathname, item.href) && "bg-dmi-blue-100 font-medium"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
