// Hand-maintained display taxonomy: labels, order, icons and colours.
// The generator (scripts/extract-register.py) never touches this file.

import type { Actielijn, DomainCode, Geschiktheid } from "./types";

export interface DomainInfo {
  code: DomainCode;
  slug: string;
  label: string;
  short: string;
  /** lucide-react icon name, resolved in components/domain-icon.tsx */
  icon: string;
  description: string;
}

export const domainOrder: DomainCode[] = ["A", "B", "C", "D", "E", "F", "G", "H", "X"];

export const domains: Record<DomainCode, DomainInfo> = {
  A: {
    code: "A",
    slug: "bouwen",
    label: "Bouwen",
    short: "Bouwen",
    icon: "building-2",
    description:
      "Woningbouwopgave, transformatie van bestaande gebouwen, zero-emissie bouwen en natuurinclusief bouwen.",
  },
  B: {
    code: "B",
    slug: "ruimtelijke-ordening",
    label: "Ruimtelijke ordening en -inrichting",
    short: "Ruimtelijke ordening",
    icon: "map",
    description:
      "Dichtheid, functiemenging en nabijheid van voorzieningen: hoe de stad ruimtelijk is ingericht.",
  },
  C: {
    code: "C",
    slug: "verkeer-mobiliteit-logistiek",
    label: "Verkeer, mobiliteit en logistiek",
    short: "Mobiliteit",
    icon: "bike",
    description:
      "Modal split, fiets- en voetgangersinfrastructuur, autobezit, deelmobiliteit, laadinfrastructuur en parkeren.",
  },
  D: {
    code: "D",
    slug: "veiligheid",
    label: "Veiligheid",
    short: "Veiligheid",
    icon: "shield-check",
    description:
      "Sociale en verkeersveiligheid, externe veiligheid en waterveiligheid.",
  },
  E: {
    code: "E",
    slug: "gezondheid-welzijn",
    label: "Gezondheid en welzijn",
    short: "Gezondheid",
    icon: "heart-pulse",
    description:
      "Ervaren gezondheid, kwetsbare groepen, sociale cohesie, geluid, hittestress en luchtkwaliteit.",
  },
  F: {
    code: "F",
    slug: "energie-klimaat",
    label: "Energie en klimaat",
    short: "Energie & klimaat",
    icon: "zap",
    description:
      "Energielabels en -gebruik, warmtetransitie, netcongestie, energiearmoede, CO₂ en klimaatadaptatie.",
  },
  G: {
    code: "G",
    slug: "milieu-natuur-ecologie",
    label: "Milieu, natuur en ecologie",
    short: "Natuur",
    icon: "trees",
    description: "Groenkwaliteit, ecosysteemkwaliteit en connectiviteit van groen en blauw.",
  },
  H: {
    code: "H",
    slug: "circulariteit",
    label: "Circulariteit",
    short: "Circulariteit",
    icon: "recycle",
    description: "Huishoudelijk afval en circulair bouwen.",
  },
  X: {
    code: "X",
    slug: "context",
    label: "Context (overig)",
    short: "Context",
    icon: "users",
    description:
      "Contextgegevens zoals inwoners, huishoudens, inkomen, woningvoorraad en stedelijkheid.",
  },
};

export function domainBySlug(slug: string): DomainInfo | undefined {
  return Object.values(domains).find((d) => d.slug === slug);
}

// ---------------------------------------------------------------- geschiktheid

export const geschiktheidOrder: Geschiktheid[] = ["goed", "gewenst", "beperkt", "niet"];

export const geschiktheidLabels: Record<Geschiktheid, string> = {
  goed: "Goed",
  gewenst: "Gewenst",
  beperkt: "Beperkt",
  niet: "Niet",
};

/**
 * Validated with the dataviz palette validator (light, white surface): all
 * checks pass; "gewenst" sits below 3:1 so it always ships with a text label.
 */
export const geschiktheidColors: Record<Geschiktheid, string> = {
  goed: "#2f7d4f",
  gewenst: "#d39a1c",
  beperkt: "#bd5a26",
  niet: "#5b74b8",
};

/** Pale surface + ink pairs for badges. */
export const geschiktheidBadge: Record<Geschiktheid, { bg: string; fg: string }> = {
  goed: { bg: "#e4f2e0", fg: "#2b5a3a" },
  gewenst: { bg: "#fdeecd", fg: "#7a5410" },
  beperkt: { bg: "#f9e3d6", fg: "#8a3f17" },
  niet: { bg: "#e6ebf6", fg: "#3b4f86" },
};

// ---------------------------------------------------------------- Blauwdruk G40

export const actielijnOrder: Actielijn[] = ["A", "B", "C", "D", "E", "F"];

/**
 * Working titles — the Excel only carries the letter. To be confirmed against
 * the Blauwdruk G40 document.
 */
export const actielijnen: Record<Actielijn, { title: string; description: string }> = {
  A: {
    title: "Integrale, binnenstedelijke vernieuwing",
    description:
      "Binnenstedelijk en adaptief bouwen, met bereikbaarheid en de ontwerpprincipes als vertrekpunt.",
  },
  B: {
    title: "Ontwerpen op nabijheid en bereikbaarheid",
    description:
      "STOMP, fiets- en OV-netwerken, knooppunten, buurtcentra, laadinfrastructuur en digitalisering.",
  },
  C: {
    title: "Mobiliteitsvernieuwing",
    description:
      "Hubs, deelmobiliteit en MaaS, selectieve toegang, minder parkeerplaatsen en zero-emissie logistiek.",
  },
  D: {
    title: "Duurzaam en circulair bouwen",
    description:
      "Stikstofvrij en circulair bouwen, schone bouwlogistiek, energie en isolatie, gedeeld informatiebeeld.",
  },
  E: {
    title: "Groen, water en biodiversiteit",
    description:
      "Gemeenschappelijk groen, waterberging, natuurinclusief bouwen en het tegengaan van verstening.",
  },
  F: {
    title: "Betaalbaar wonen, bewoner centraal",
    description:
      "Betaalbare woningen, doorstroming, betrokkenheid van (toekomstige) bewoners en gedeelde voorzieningen.",
  },
};

// ---------------------------------------------------------------- indicator types

/** Indicator chain from context to impact (column Indicator_Type). */
export const indicatorTypes: { value: number; label: string; description: string }[] = [
  { value: 0, label: "Context", description: "Achtergrondkenmerken van het gebied" },
  { value: 1, label: "Inputs", description: "Ingezette middelen en randvoorwaarden" },
  { value: 2, label: "Activiteiten", description: "Wat er wordt gedaan" },
  { value: 3, label: "Outputs", description: "Directe resultaten van activiteiten" },
  { value: 4, label: "Omgevingstoestand", description: "Toestand van de fysieke leefomgeving" },
  { value: 5, label: "Blootstelling", description: "Mate waarin mensen worden blootgesteld" },
  { value: 6, label: "Percepties", description: "Hoe bewoners hun omgeving ervaren" },
  { value: 7, label: "Gedrag", description: "Wat mensen doen" },
  { value: 8, label: "Outcomes", description: "Effecten op korte en middellange termijn" },
  { value: 9, label: "Impacts", description: "Maatschappelijke effecten op lange termijn" },
];

export function indicatorTypeLabel(value: number | null): string | null {
  if (value === null) return null;
  return indicatorTypes.find((t) => t.value === value)?.label ?? null;
}

// ---------------------------------------------------------------- spatial scale

export type Schaal =
  | "raster"
  | "gebouw"
  | "postcode"
  | "buurt"
  | "wijk"
  | "gemeente"
  | "provincie"
  | "landelijk"
  | "onbekend";

export const schaalOrder: Schaal[] = [
  "raster",
  "gebouw",
  "postcode",
  "buurt",
  "wijk",
  "gemeente",
  "provincie",
  "landelijk",
  "onbekend",
];

export const schaalLabels: Record<Schaal, string> = {
  raster: "Raster / punt",
  gebouw: "Gebouw",
  postcode: "Postcode (PC4/PC6)",
  buurt: "Buurt",
  wijk: "Wijk",
  gemeente: "Gemeente",
  provincie: "Provincie",
  landelijk: "Landelijk",
  onbekend: "Onbekend",
};

export const frequentieOrder = [
  "vaker dan jaarlijks",
  "jaarlijks",
  "eens per 2 tot eens per 5 jaar",
  "eens per 5 tot eens per 10 jaar",
  "minder vaak dan eens per 10 jaar",
  "onduidelijk",
];
