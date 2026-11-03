// Hand-maintained copy for the /ecosysteem page, based on the DMI-ecosysteem
// diagram (beheerraad, juni 2026).

export type EcoNodeId =
  | "dmi"
  | "register"
  | "pdx"
  | "vraag"
  | "aanbod"
  | "dashboard"
  | "csc";

export interface EcoNode {
  id: EcoNodeId;
  title: string;
  subtitle: string;
  body: string[];
  link?: { href: string; label: string };
}

export const ecoNodes: Record<EcoNodeId, EcoNode> = {
  dmi: {
    id: "dmi",
    title: "DMI-ecosysteem",
    subtitle: "Signaleert, faciliteert en borgt",
    body: [
      "Signaleert informatiebehoeften van gemeenten en beleidsmakers.",
      "Stuurt en faciliteert het ecosysteem van overheden, bedrijven en kennisinstellingen.",
      "Stelt kaders en borgt de kwaliteit van indicatoren en data.",
    ],
  },
  register: {
    id: "register",
    title: "Indicatorenregister",
    subtitle: "Beschikbare en gewenste indicatoren en metadata",
    body: [
      "Het register geeft een overzicht van bestaande, landsdekkende indicatoren die samen het onderwerp slimme duurzame verstedelijking en mobiliteitsvernieuwing beschrijven.",
      "Naast beschikbare indicatoren (‘Goed’) benoemt het register ook gewenste indicatoren (‘Gewenst’): duidelijke informatiebehoeften waarvoor nog geen complete of landsdekkende bron bestaat. Dat is een signaal richting data-aanbieders.",
      "Het register wordt geplaatst op en in de PDX, zodat het vindbaar en koppelbaar is voor vraag én aanbod.",
    ],
    link: { href: "/indicatoren", label: "Naar de indicatoren" },
  },
  pdx: {
    id: "pdx",
    title: "PDX",
    subtitle: "Platform voor data-uitwisseling en transacties",
    body: [
      "De PDX verbindt vraag en aanbod: gemeenten plaatsen informatiebehoeften, aanbieders bieden datasets en indicatoren aan.",
      "Via de PDX lopen transacties en data-uitwisseling. Beschikbare indicatoren en data komen zo terug bij gemeenten.",
      "Het indicatorenregister op de PDX biedt aanknopingspunten voor koppelingen met andere data-aanbieders.",
    ],
  },
  vraag: {
    id: "vraag",
    title: "Vraag",
    subtitle: "Gemeenten en beleidsmakers",
    body: [
      "Gemeenten (onder meer de G40) en beleidsmakers formuleren informatiebehoeften vanuit hun beleid, zoals de Blauwdruk G40.",
      "Gemeentelijke dashboards maken gebruik van de beschikbare indicatoren en data.",
    ],
    link: { href: "/blauwdruk", label: "Naar de Blauwdruk G40" },
  },
  aanbod: {
    id: "aanbod",
    title: "Aanbod",
    subtitle: "Marktpartijen, dataleveranciers en kennisinstellingen",
    body: [
      "Marktpartijen, dataleveranciers en kennisinstellingen bieden datasets en indicatoren aan.",
      "Gewenste indicatoren in het register laten zien waar behoefte bestaat en nieuwe of verrijkte data waarde kan toevoegen.",
    ],
    link: { href: "/indicatoren?g=gewenst", label: "Bekijk gewenste indicatoren" },
  },
  dashboard: {
    id: "dashboard",
    title: "DMI-dashboard",
    subtitle: "Integrale monitoring G40 Blauwdruk, landelijk vergelijken",
    body: [
      "Het DMI-dashboard gebruikt de indicatoren uit het register voor integrale monitoring van de Blauwdruk G40 en om gemeenten landelijk te vergelijken.",
      "De MVP-user stories zijn gekoppeld aan beleidsbouwblokken en capabilities uit de Digital Twin Capabilities Periodic Table.",
    ],
    link: { href: "/user-stories", label: "Naar de user stories" },
  },
  csc: {
    id: "csc",
    title: "City Support Centre",
    subtitle: "Ondersteuning en advies voor gemeenten",
    body: ["Het City Support Centre ondersteunt en adviseert gemeenten bij het gebruik van data en indicatoren."],
  },
};

export const roadmap = [
  { date: "2026-12-02", title: "Oplevering versie 1.0 van indicatorenregister en dashboard", done: false },
  {
    date: "2027",
    title: "Organisatie en beheer inrichten, rol van de DMI-community bepalen en uittesten in de praktijk",
    done: false,
  },
];
