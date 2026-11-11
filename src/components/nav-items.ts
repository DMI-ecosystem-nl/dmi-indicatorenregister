export type NavIcon =
  | "home"
  | "layout-grid"
  | "landmark"
  | "help-circle"
  | "bar-chart"
  | "grid"
  | "network"
  | "workflow"
  | "boxes"
  | "info";

export type NavCount = "domains" | "actions" | "questions" | "indicators";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
  count?: NavCount;
}

export const navGroups: { label: string | null; items: NavItem[] }[] = [
  { label: null, items: [{ href: "/", label: "Overzicht", icon: "home" }] },
  {
    label: "Ingangen",
    items: [
      { href: "/domeinen", label: "DMI-domeinen", icon: "layout-grid", count: "domains" },
      { href: "/blauwdruk", label: "Blauwdruk G40", icon: "landmark", count: "actions" },
      { href: "/vragen", label: "Monitoringsvragen", icon: "help-circle", count: "questions" },
    ],
  },
  {
    label: "Catalogus",
    items: [{ href: "/indicatoren", label: "Indicatoren", icon: "bar-chart", count: "indicators" }],
  },
  {
    label: "Analyse",
    items: [{ href: "/blauwdruk/matrix", label: "Dekkingsmatrix", icon: "grid" }],
  },
  {
    label: "Achtergrond",
    items: [
      { href: "/ecosysteem", label: "Ecosysteem & PDX", icon: "network" },
      { href: "/methodiek", label: "Proces & methodiek", icon: "workflow" },
      { href: "/user-stories", label: "User stories & CPT", icon: "boxes" },
      { href: "/over", label: "Over dit register", icon: "info" },
    ],
  },
];

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/blauwdruk") return pathname === "/blauwdruk" || /^\/blauwdruk\/(?!matrix)/.test(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}
