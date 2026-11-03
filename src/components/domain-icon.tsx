import {
  Bike,
  Building2,
  HeartPulse,
  Map,
  Recycle,
  ShieldCheck,
  Trees,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { domains } from "@/data/taxonomy";
import type { DomainCode } from "@/data/types";

const ICONS: Record<string, LucideIcon> = {
  "building-2": Building2,
  map: Map,
  bike: Bike,
  "shield-check": ShieldCheck,
  "heart-pulse": HeartPulse,
  zap: Zap,
  trees: Trees,
  recycle: Recycle,
  users: Users,
};

export function DomainIcon({ code, className }: { code: DomainCode; className?: string }) {
  const Icon = ICONS[domains[code].icon] ?? Map;
  return <Icon className={className} aria-hidden />;
}
