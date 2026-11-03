// Hand-maintained content from "CPT_Koppeling_Userstories_Final.docx":
// MVP user stories of the DMI-dashboard ↔ beleidsbouwblokken ↔ Digital Twin
// Capabilities Periodic Table (CPT, Digital Twin Consortium).

export type CptGroup = "DS" | "IR" | "IC" | "MG" | "TW" | "UX";

export const cptGroups: Record<CptGroup, { label: string; bg: string; border: string }> = {
  DS: { label: "Data Services", bg: "#eef4fc", border: "#c9daf2" },
  IR: { label: "Integration", bg: "#fdf8e8", border: "#efe0ac" },
  IC: { label: "Intelligence", bg: "#f5f1fb", border: "#ddd0ef" },
  UX: { label: "UX", bg: "#eef8f5", border: "#c5e5da" },
  MG: { label: "Management", bg: "#f6f7f8", border: "#dcdfe3" },
  TW: { label: "Trustworthiness", bg: "#fbefec", border: "#efcfc8" },
};

/** [code, name] laid out as the CPT: 8 rows × 8 columns, null = empty slot. */
export const cptGrid: ([string, string] | null)[][] = [
  [["DS.AR", "AI Model Repository"], ["DS.AG", "Data Aggregation"], ["IR.AS", "API Services"], null, null, null, ["UX.GM", "Gamification"], ["UX.DB", "Dashboards"]],
  [["DS.SR", "Simulation Model Repository"], ["DS.AS", "Asynchronous Integration"], ["IR.CL", "Collaboration platform integration"], ["IC.CS", "Composition"], ["IC.SM", "Simulation"], ["IC.RP", "Reporting"], ["UX.3R", "3D rendering"], ["UX.XR", "Extended Reality (XR)"]],
  [["DS.SA", "Data Storage and Archive Services"], ["DS.RT", "Real-time processing"], ["IR.DT", "Digital Twin Integration"], ["IC.DL", "Distributed Ledger and Smart Contracts"], ["IC.FL", "Federated Learning"], ["IC.AL", "Alerts and Notification"], ["UX.GE", "Gaming Engine Visualization"], ["UX.ER", "Entity Relationship Visualization"]],
  [["DS.DS", "Domain Specific Data Management"], ["DS.BP", "Batch Processing"], ["IR.IO", "OT/IoT system integration"], ["IC.BR", "Business Rules"], ["IC.AI", "Artificial Intelligence"], ["IC.OS", "Orchestration"], ["UX.BP", "Business Process Management & Workflow"], ["UX.RM", "Real-time Monitoring"]],
  [["DS.IR", "Digital Twin Instance Repository"], ["DS.CX", "Data Contextualization"], ["IR.EG", "Engineering systems integration"], ["IC.PS", "Prescriptive Recommendations"], ["IC.PR", "Prediction"], ["IC.IC", "Command and Control"], ["UX.BI", "Business Intelligence"], ["UX.AV", "Advanced Visualization"]],
  [["DS.RP", "Digital Twin Model Repository"], ["DS.TR", "Data Transformation and Wrangling"], ["IR.ET", "Enterprise system integration"], ["IC.MA", "Mathematical Analytics"], ["IC.AA", "Data Analysis and Analytics"], ["IC.SR", "Search"], ["UX.CI", "Continuous Intelligence"], ["UX.BV", "Basic Visualization"]],
  [["DS.ON", "Ontology Management"], ["DS.ST", "Data Streaming"], ["MG.DG", "Data Governance"], ["MG.SM", "System Monitoring"], ["TW.RP", "Responsibility"], ["TW.RL", "Reliability"], ["TW.PR", "Privacy"], ["TW.DS", "Device Security"]],
  [["DS.SG", "Synthetic Data Generation"], ["DS.AI", "Data Acquisition and Ingestion"], ["MG.EL", "Event Logging"], ["MG.DM", "Device Management"], ["TW.RS", "Resilience"], ["TW.SF", "Safety"], ["TW.SC", "Security"], ["TW.EX", "Data Encryption"]],
];

export interface StoryRow {
  block: string;
  capability: string;
  role: string;
}

export interface UserStory {
  id: string;
  title: string;
  blocks: string[];
  rows: StoryRow[];
}

export const userStories: UserStory[] = [
  {
    id: "US-1",
    title: "Integraal overzicht",
    blocks: ["Visualiseren", "Integreren", "Analyseren", "Rekenen"],
    rows: [
      { block: "Visualiseren", capability: "UX.DB", role: "Presenteren van bestuurlijke KPI-overzichten" },
      { block: "Visualiseren", capability: "UX.BI", role: "Visualiseren van samenhang en vergelijkingen" },
      { block: "Integreren", capability: "DS.AG", role: "Samenbrengen van indicatoren uit meerdere domeinen" },
      { block: "Analyseren", capability: "DS.CX", role: "Duiden van samenhang en context tussen indicatoren" },
      { block: "Analyseren", capability: "IC.AA", role: "Analyseren van samenhang tussen indicatoren" },
      { block: "Rekenen", capability: "IC.MA", role: "Normalisatie en scorevorming" },
      { block: "Rekenen", capability: "IC.BR", role: "Toepassen van rekenregels en scoringslogica" },
    ],
  },
  {
    id: "US-2",
    title: "Trends over tijd bekijken",
    blocks: ["Tijdreizen", "Visualiseren", "Analyseren"],
    rows: [
      { block: "Tijdreizen", capability: "DS.DS", role: "Beheer van historische en temporele data" },
      { block: "Visualiseren", capability: "UX.BI", role: "Visualiseren van trends en voortgang" },
      { block: "Analyseren", capability: "IC.AA", role: "Interpreteren van ontwikkelingen door de tijd" },
    ],
  },
  {
    id: "US-3",
    title: "Inzicht in definities van indicatoren",
    blocks: ["Identificeren", "Vertrouwen"],
    rows: [
      { block: "Identificeren", capability: "DS.RP", role: "Beheer van definities, metadata en indicatorstructuren" },
      { block: "Vertrouwen", capability: "DS.CX", role: "Toevoegen van betekenis en context aan indicatoren" },
      { block: "Identificeren", capability: "IC.SR", role: "Raadplegen en terugvinden van definities en toelichtingen" },
    ],
  },
  {
    id: "US-4",
    title: "Herkomst van data inzichtelijk maken",
    blocks: ["Vertrouwen", "Identificeren", "Integreren"],
    rows: [
      { block: "Vertrouwen", capability: "MG.DG", role: "Borgen van kwaliteit, eigenaarschap en betrouwbaarheid van data" },
      { block: "Vertrouwen", capability: "TW.RP", role: "Transparant en verantwoord gebruik van indicatorinformatie" },
      { block: "Identificeren", capability: "DS.CX", role: "Koppelen van indicatoren aan broninformatie en metadata" },
      { block: "Integreren", capability: "IR.ET", role: "Federatief verbinden van bestaande databronnen" },
      { block: "Integreren", capability: "IR.DT", role: "Integreren van dashboards en digital twin-omgevingen" },
    ],
  },
  {
    id: "US-5",
    title: "Inzicht in berekeningswijze",
    blocks: ["Bewerken", "Rekenen", "Vertrouwen", "Identificeren"],
    rows: [
      { block: "Bewerken", capability: "IC.BR", role: "Configureren van rekenregels en vergelijkmethodieken" },
      { block: "Rekenen", capability: "IC.MA", role: "Normalisatie, mathematische verwerking en scorevorming" },
      { block: "Identificeren", capability: "DS.RP", role: "Vastleggen van definities en berekeningsmethodieken" },
      { block: "Vertrouwen", capability: "MG.DG", role: "Transparantie en consistent gebruik van berekeningen" },
    ],
  },
  {
    id: "US-6",
    title: "Gemeenten vergelijken",
    blocks: ["Visualiseren", "Integreren", "Analyseren", "Rekenen"],
    rows: [
      { block: "Visualiseren", capability: "UX.BI", role: "Visualiseren van benchmarkinformatie en vergelijkingen" },
      { block: "Visualiseren", capability: "UX.DB", role: "Presenteren van bestuurlijke vergelijkingsoverzichten" },
      { block: "Integreren", capability: "DS.AG", role: "Samenbrengen van datasets uit meerdere gemeenten" },
      { block: "Analyseren", capability: "IC.AA", role: "Analyse van verschillen en patronen tussen gemeenten" },
      { block: "Rekenen", capability: "IC.MA", role: "Normalisatie en vergelijkbare scorevorming" },
    ],
  },
  {
    id: "US-7",
    title: "Vergelijken met normen en referentiewaarden",
    blocks: ["Rekenen", "Analyseren", "Visualiseren"],
    rows: [
      { block: "Rekenen", capability: "IC.BR", role: "Toepassen van normen, grenswaarden en vergelijkregels" },
      { block: "Rekenen", capability: "IC.MA", role: "Mathematische vergelijking en afwijkingsberekeningen" },
      { block: "Analyseren", capability: "IC.AA", role: "Interpreteren van prestaties ten opzichte van normen" },
      { block: "Visualiseren", capability: "UX.BI", role: "Visualiseren van afwijkingen en normvergelijkingen" },
    ],
  },
];

/** All 16 beleidsbouwblokken; `mvp` = used by the MVP user stories. */
export const beleidsbouwblokken: { name: string; mvp: boolean }[] = [
  { name: "Ontsluiten", mvp: false },
  { name: "Bewerken", mvp: true },
  { name: "Zoeken/vinden", mvp: false },
  { name: "Tijdreizen", mvp: true },
  { name: "Reproduceren", mvp: false },
  { name: "Meten/Aansturen", mvp: false },
  { name: "Integreren", mvp: true },
  { name: "Analyseren", mvp: true },
  { name: "Voorspellen", mvp: false },
  { name: "Orkestratie", mvp: false },
  { name: "Simuleren", mvp: false },
  { name: "Rekenen", mvp: true },
  { name: "Visualiseren", mvp: true },
  { name: "Beleven", mvp: false },
  { name: "Vertrouwen", mvp: true },
  { name: "Identificeren", mvp: true },
];

export const cptConclusion =
  "De MVP van het DMI-dashboard leunt vooral op de beleidsbouwblokken Visualiseren, Integreren, Analyseren, Tijdreizen en Vertrouwen. Deze bouwblokken ondersteunen de kern van de MVP: integraal overzicht, trends, transparantie en vergelijken. Meer geavanceerde bouwblokken zoals Voorspellen, Simuleren en Beleven passen beter bij latere ontwikkelfasen.";
