// Hand-maintained types for the generated register data (./generated/register.ts).

/** DMI-domein letter as used in the register ("A. Bouwen" → "A"). */
export type DomainCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "X";

/** Outcome of the indicator assessment. */
export type Geschiktheid = "goed" | "gewenst" | "beperkt" | "niet";

/** G40 Blauwdruk actielijn letter. */
export type Actielijn = "A" | "B" | "C" | "D" | "E" | "F";

export type JaNee = "ja" | "nee" | "beperkt" | "onduidelijk";

/** One change an overlay (newer register version) made to an indicator. */
export interface IndicatorChange {
  /** Register version that made the change, e.g. "0.94". */
  version: string;
  /**
   * "added" = new in this version; "register" = left the register (no longer
   * in the Goed selection); the other fields carry the old and new value.
   */
  field: "geschiktheid" | "domain" | "name" | "register" | "added";
  from: string | null;
  to: string | null;
}

export interface Norm {
  waarde: string | null;
  jaar: number | null;
  bron: string | null;
}

export interface Indicator {
  /** Unique, URL-safe key (source IDs are not unique in v0.9). */
  slug: string;
  /** Source ID, e.g. "IND.025.12". */
  id: string;
  /** Register code ("Volgorde register", e.g. "B09"); shared by grouped indicators. */
  indeling: string | null;
  name: string;
  geschiktheid: Geschiktheid;
  /** True when the indicator is in the current register (Goed per latest printout + Gewenst). */
  inRegister: boolean;
  /** What later register versions changed, oldest first. */
  changes: IndicatorChange[];
  toelichting: string | null;
  benodigdVoorGoed: string | null;
  vraagId: string;
  domain: DomainCode;
  domain2: DomainCode | null;
  cluster: string | null;
  blauwdruk: string[];
  /** Indicator type 0–9 (context → impacts), see taxonomy.indicatorTypes. */
  type: number | null;
  /** Dashboard / platform where the indicator is published. */
  bron: string | null;
  bronUrl: string | null;
  bronLabel: string | null;
  /** Article or page that describes the source. */
  bronBeschrijving: string | null;
  bronBeschrijvingUrl: string | null;
  /** Organisation that manages the indicator. */
  beheerder: string | null;
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
  /** "meting" (measured) or "model" (modelled). */
  modelMeting: string | null;
  /** Spatial form of the data: gebiedsniveau, raster, vlak, punt, lijn. */
  typeData: string | null;
  /** Geographic coverage, e.g. "landsdekkend". */
  dekking: string | null;
  bewerkingNodig: boolean | null;
  meetmethode: string | null;
  /** Policy norm or target value, when one exists. */
  norm: Norm | null;
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

export interface RegisterSource {
  version: string;
  date: string;
  format: "xlsx" | "pdf";
  title: string;
  /** What this source contributes to the site. */
  role: string;
}

export interface RegisterMeta {
  /** Current register version (newest source). */
  version: string;
  versionDate: string;
  /** Source files, oldest first. */
  sources: RegisterSource[];
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
