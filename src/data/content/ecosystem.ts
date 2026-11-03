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
      "Het register geeft een overzicht van bestaande, landsdekkende indicatoren. Samen beschrijven zij slimme duurzame verstedelijking en mobiliteitsvernieuwing.",
      "Het register noemt ook gewenste indicatoren (‘Gewenst’). Daarvoor is een duidelijke informatiebehoefte, maar nog geen complete of landsdekkende bron. Dat is een signaal voor data-aanbieders.",
      "Het register komt op de PDX. Daar kunnen gemeenten en data-aanbieders het vinden en gebruiken.",
    ],
    link: { href: "/indicatoren", label: "Naar de indicatoren" },
  },
  pdx: {
    id: "pdx",
    title: "PDX",
    subtitle: "Platform voor data-uitwisseling en transacties",
    body: [
      "De PDX verbindt vraag en aanbod: gemeenten plaatsen informatiebehoeften, aanbieders bieden datasets en indicatoren aan.",
      "Transacties en data-uitwisseling lopen via de PDX. Zo komen beschikbare indicatoren en data bij gemeenten.",
      "Het register op de PDX laat data-aanbieders zien welke indicatoren gemeenten nodig hebben.",
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
      "De gewenste indicatoren in het register laten zien waar nog data nodig is.",
    ],
    link: { href: "/indicatoren?g=gewenst", label: "Bekijk gewenste indicatoren" },
  },
  dashboard: {
    id: "dashboard",
    title: "DMI-dashboard",
    subtitle: "Integrale monitoring G40 Blauwdruk, landelijk vergelijken",
    body: [
      "Het DMI-dashboard gebruikt de indicatoren uit het register. Het dashboard monitort de Blauwdruk G40 integraal en vergelijkt gemeenten landelijk.",
      "De user stories van de eerste versie (MVP) zijn gekoppeld aan beleidsbouwblokken en aan functies uit de Digital Twin Capabilities Periodic Table.",
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
