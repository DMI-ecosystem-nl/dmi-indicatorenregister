"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { SidebarNav, type SidebarData } from "./sidebar-nav";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

export function MobileMenu({ data, children }: { data: SidebarData; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Menu openen" />}>
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-heading text-dmi-navy">Indicatorenregister</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 px-3 pb-6">
          <SidebarNav data={data} onNavigate={() => setOpen(false)} />
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
