// Hand-maintained types for the generated register data (./generated/register.ts).

/** DMI-domein letter as used in the register ("A. Bouwen" → "A"). */
export type DomainCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "X";

/** Outcome of the indicator assessment. */
export type Geschiktheid = "goed" | "gewenst" | "beperkt" | "niet";

/** G40 Blauwdruk actielijn letter. */
export type Actielijn = "A" | "B" | "C" | "D" | "E" | "F";

export type JaNee = "ja" | "nee" | "beperkt" | "onduidelijk";

export interface Indicator {
  /** Unique, URL-safe key (source IDs are not unique in v0.9). */
  slug: string;
  /** Source ID, e.g. "IND.025.12". */
  id: string;
  /** "Indeling" code from the v0.91 register (e.g. "B09"); shared by grouped indicators. */
  indeling: string | null;
  name: string;
  geschiktheid: Geschiktheid;
  /** Assessment in the v0.9 Excel when it differs from the v0.91 overlay. */
  geschiktheidV09: Geschiktheid | null;
  /** True when the indicator is part of the v0.91 register printout. */
  inRegister: boolean;
  toelichting: string | null;
  benodigdVoorGoed: string | null;
  vraagId: string;
  domain: DomainCode;
  /** Domain in the v0.9 Excel when v0.91 re-assigned it ("DMI domein nieuw"). */
  domainV09: DomainCode | null;
  domain2: DomainCode | null;
  cluster: string | null;
  blauwdruk: string[];
  /** Indicator type 0–9 (context → impacts), see taxonomy.indicatorTypes. */
  type: number | null;
  /** Dashboard / platform where the indicator is published. */
  bron: string | null;
  bronUrl: string | null;
  bronLabel: string | null;
  dataverzamelaar: string | null;
  openbaar: JaNee | null;
  vrijGebruik: JaNee | null;
  voorwaarden: string | null;
  eenheid: string | null;
  frequentie: string | null;
  meestRecentJaar: number | null;
  schaalniveau: string | null;
  laagsteSchaal: string | null;
  historie: boolean | null;
  historieNote: string | null;
  prognose: string | null;
}

export interface MonitoringQuestion {
  /** e.g. "V.025" */
  id: string;
  slug: string;
  title: string;
  /** Core question as formulated in v0.83C. */
  kernvraag: string | null;
  variaties: string | null;
  domains: DomainCode[];
  blauwdruk: string[];
  indicatorSlugs: string[];
  counts: Record<Geschiktheid, number>;
  /** Has at least one Goed or Gewenst indicator. */
  inRegister: boolean;
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

export interface RegisterMeta {
  excelVersion: string;
  excelDate: string;
  pdfVersion: string;
  pdfDate: string;
  intro: string;
  geschiktheidDefinitions: Record<Geschiktheid, string>;
  phases: { code: string; name: string }[];
  phaseStatus: PhaseStatus[];
  timeline: TimelineEvent[];
}
