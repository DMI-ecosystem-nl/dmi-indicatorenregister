// Short explanations of the metadata fields, shown behind the info icon next
// to each field label on an indicator page.
//
// Keys are the column names of the register Excel (uitdraai), so the table
// TNO is writing can be pasted in one-to-one. The texts below are drafts
// until that table arrives.

export const fieldLabels = {
  dashboard: "Dashboard",
  indicatorType: "Indicator type",
  modelMeting: "Model / Meting",
  openbaar: "Openbaar toegankelijk",
  vrijGebruik: "Data vrij te gebruiken",
  voorwaarden: "Onder welke voorwaarden",
  beheerder: "Indicator beheerder",
  frequentie: "Frequentie",
  meestRecentJaar: "Meest recent jaar",
  typeData: "Type data",
  laagsteSchaal: "Laagste schaalniveau",
  dekking: "Dekking",
  historie: "Historie",
  dataverzamelaar: "Dataverzamelaar",
  prognose: "Prognose",
  eenheid: "Eenheid",
  meetmethode: "Meetmethode",
  normwaarde: "Normwaarde",
  normJaar: "Norm jaar",
  normBron: "Norm bron",
} as const;

export type FieldKey = keyof typeof fieldLabels;

export const fieldHelp: Record<FieldKey, string> = {
  dashboard: "Het dashboard of platform waar de indicator te vinden is.",
  indicatorType: "De plek van de indicator in de keten van context tot impact.",
  modelMeting: "Meting: de waarde is gemeten of geteld. Model: de waarde is berekend of geschat met een model.",
  openbaar: "Of iedereen de data kan inzien, zonder account of aanvraag.",
  vrijGebruik: "Of je de data mag hergebruiken, bijvoorbeeld in een eigen dashboard.",
  voorwaarden: "De voorwaarden voor het gebruik van de data.",
  beheerder: "De organisatie die de indicator beheert.",
  frequentie: "Hoe vaak er nieuwe cijfers komen.",
  meestRecentJaar: "Het meest recente jaar waarover cijfers beschikbaar zijn.",
  typeData: "De ruimtelijke vorm van de data: per gebied, als raster, vlak, lijn of punt.",
  laagsteSchaal: "Het kleinste gebied waarvoor cijfers beschikbaar zijn, bijvoorbeeld een buurt of gemeente.",
  dekking: "Of de data heel Nederland dekt, of dat er gemeenten of regio’s ontbreken.",
  historie: "Of er ook cijfers over eerdere jaren zijn, zodat je een trend kunt zien.",
  dataverzamelaar: "De organisatie die de onderliggende data verzamelt.",
  prognose: "Of er ook verwachte waarden voor de toekomst zijn.",
  eenheid: "De eenheid van de indicator, bijvoorbeeld een aantal of een percentage.",
  meetmethode: "Hoe de waarde wordt gemeten of berekend, en met welke data.",
  normwaarde: "De waarde die een norm of beleidsdoel vastlegt.",
  normJaar: "Het jaar waarin de norm geldt of gehaald moet zijn.",
  normBron: "Het besluit of document waarin de norm staat.",
};
