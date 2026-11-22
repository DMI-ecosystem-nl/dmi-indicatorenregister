// Hand-maintained types for the generated register data (./generated/register.ts).

/** DMI-domein letter as used in the register ("A. Bouwen" → "A"). */
export type DomainCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "X";

/**
 * Outcome of the indicator assessment. "goed" is the internal key for
 * "Geschikt" (older sources said "Goed").
 */
export type Geschiktheid = "goed" | "gewenst" | "beperkt" | "niet";

/** The assessments that are in the register (Beperkt and Niet are left out). */
export type RegisterGeschiktheid = Extract<Geschiktheid, "goed" | "gewenst">;

/** G40 Blauwdruk actielijn letter. */
export type Actielijn = "A" | "B" | "C" | "D" | "E" | "F";

export type JaNee = "ja" | "nee" | "beperkt" | "onduidelijk";

export interface Norm {
  waarde: string | null;
  jaar: number | null;
  bron: string | null;
}

export interface Indicator {
  /** Unique, URL-safe key (source IDs are not always unique). */
  slug: string;
  /** Source ID, e.g. "IND.025.12". */
  id: string;
  name: string;
  geschiktheid: RegisterGeschiktheid;
  vraagId: string;
  /** Hoofd-DMI-domein. */
  domain: DomainCode;
  /** Every domain the indicator is relevant to (✓ columns), hoofddomein first. */
  domains: DomainCode[];
  blauwdruk: string[];
  /** Indicator type 0–9 (context → impacts), see taxonomy.indicatorTypes. */
  type: number | null;
  /** Dashboard / platform where the indicator is published. */
  bron: string | null;
  /** "Brondata": link to the data. */
  bronUrl: string | null;
  /** "Bron beschrijving": what the indicator measures, in a few sentences. */
  beschrijving: string | null;
  /** "Meting", "Model" or "Geen". */
  modelMeting: string | null;
  openbaar: JaNee | null;
  vrijGebruik: JaNee | null;
  voorwaarden: string | null;
  /** Organisation that manages the indicator. */
  beheerder: string | null;
  frequentie: string | null;
  meestRecentJaar: number | "onduidelijk" | null;
  /** Spatial form of the data: gebiedsniveau, raster, vlak, punt, lijn. */
  typeData: string | null;
  laagsteSchaal: string | null;
  /** Geographic coverage, e.g. "Landsdekkend". */
  dekking: string | null;
  historie: JaNee | null;
  dataverzamelaar: string | null;
  prognose: string | null;
  eenheid: string | null;
  meetmethode: string | null;
  /** Policy norm or target value, when one exists. */
  norm: Norm | null;
}

export interface MonitoringQuestion {
  /** e.g. "V.025" */
  id: string;
  slug: string;
  title: string;
  /** Full wording of the question (background Excel, sheet V83C). */
  kernvraag: string | null;
  variaties: string | null;
  domains: DomainCode[];
  blauwdruk: string[];
  /** Indicators in the register that answer this question (at least one). */
  indicatorSlugs: string[];
  counts: Record<RegisterGeschiktheid, number>;
  /** V.700+ = additional wish list from the July session. */
  wensenlijst: boolean;
}

export interface BlueprintAction {
  /** e.g. "A3.1" */
  id: string;
  slug: string;
  actielijn: Actielijn;
  text: string;
  /** Vraag I — underlying goals and ambitions. */
  doelen: string | null;
  /** Vraag II — how to address them. */
  aanpak: string | null;
  /** Vraag III — required data, metrics and units. */
  benodigdeData: string | null;
  /** Vraag III condensed. */
  dataSamengevat: string | null;
  domains: DomainCode[];
  vraagIds: string[];
}

export interface TimelineEvent {
  date: string; // ISO yyyy-mm-dd
  title: string;
}

export interface PhaseStatus {
  domain: string;
  statuses: (string | null)[];
}

export interface RegisterSource {
  /** Register version, when the source is a register printout. */
  version: string | null;
  date: string;
  format: "xlsx" | "pdf";
  title: string;
  /** What this source contributes to the site. */
  role: string;
}

export interface RegisterMeta {
  /** Register version (the uitdraai), e.g. "0.96". */
  version: string;
  versionDate: string;
  sources: RegisterSource[];
  /** Date of the background Excel (phase status, timeline). */
  backgroundDate: string;
  intro: string;
  geschiktheidDefinitions: Record<Geschiktheid, string>;
  phases: { code: string; name: string }[];
  phaseStatus: PhaseStatus[];
  timeline: TimelineEvent[];
}
