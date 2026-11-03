// Shared lookups and derived values over the generated register data.
// Every page and view goes through these helpers so counts never disagree.

import { actions, indicators, meta, questions } from "@/data/generated/register";
import { domainOrder, geschiktheidOrder, type Schaal } from "@/data/taxonomy";
import type {
  BlueprintAction,
  DomainCode,
  Geschiktheid,
  Indicator,
  MonitoringQuestion,
} from "@/data/types";

export { actions, indicators, meta, questions };

const indicatorBySlug = new Map(indicators.map((i) => [i.slug, i]));
const questionById = new Map(questions.map((q) => [q.id, q]));
const questionBySlug = new Map(questions.map((q) => [q.slug, q]));
const actionById = new Map(actions.map((a) => [a.id, a]));
const actionBySlug = new Map(actions.map((a) => [a.slug, a]));

export const getIndicator = (slug: string) => indicatorBySlug.get(slug);
export const getQuestion = (id: string) => questionById.get(id);
export const getQuestionBySlug = (slug: string) => questionBySlug.get(slug);
export const getAction = (id: string) => actionById.get(id);
export const getActionBySlug = (slug: string) => actionBySlug.get(slug);

export const registerIndicators = indicators.filter((i) => i.inRegister);

export function indicatorsOf(question: MonitoringQuestion): Indicator[] {
  return question.indicatorSlugs
    .map((s) => indicatorBySlug.get(s))
    .filter((i): i is Indicator => Boolean(i));
}

export function questionsOfAction(action: BlueprintAction): MonitoringQuestion[] {
  return action.vraagIds
    .map((id) => questionById.get(id))
    .filter((q): q is MonitoringQuestion => Boolean(q));
}

export function actionsOf(codes: string[]): BlueprintAction[] {
  return codes.map((c) => actionById.get(c)).filter((a): a is BlueprintAction => Boolean(a));
}

/** Questions that have at least one indicator in the given domain. */
export function questionsOfDomain(code: DomainCode): MonitoringQuestion[] {
  return questions.filter((q) =>
    indicatorsOf(q).some((i) => i.domain === code)
  );
}

export function countByGeschiktheid(items: Indicator[]): Record<Geschiktheid, number> {
  const counts = { goed: 0, gewenst: 0, beperkt: 0, niet: 0 };
  for (const i of items) counts[i.geschiktheid] += 1;
  return counts;
}

/** Best (most suitable) assessment among a set of indicators. */
export function bestGeschiktheid(items: Indicator[]): Geschiktheid | null {
  for (const g of geschiktheidOrder) if (items.some((i) => i.geschiktheid === g)) return g;
  return null;
}

export function domainStats() {
  return domainOrder.map((code) => {
    const items = indicators.filter((i) => i.domain === code);
    return {
      code,
      total: items.length,
      register: items.filter((i) => i.inRegister).length,
      counts: countByGeschiktheid(items),
      questions: new Set(items.map((i) => i.vraagId)).size,
    };
  });
}

/** Normalise the two free-text scale columns into one facet value. */
export function schaalOf(indicator: Indicator): Schaal {
  const text = `${indicator.laagsteSchaal ?? ""} ${indicator.schaalniveau ?? ""}`.toLowerCase();
  if (/\d+\s*x\s*\d+|punt|raster/.test(text)) return "raster";
  if (text.includes("gebouw")) return "gebouw";
  if (/pc\s?[46]/.test(text)) return "postcode";
  if (text.includes("buurt")) return "buurt";
  if (text.includes("wijk")) return "wijk";
  if (text.includes("gemeente") || text.includes("gemeentelijk")) return "gemeente";
  if (text.includes("provinc")) return "provincie";
  if (text.includes("landelijk")) return "landelijk";
  return "onbekend";
}

export function hostOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export const totals = {
  indicators: indicators.length,
  register: registerIndicators.length,
  registerCounts: countByGeschiktheid(registerIndicators),
  allCounts: countByGeschiktheid(indicators),
  questions: questions.length,
  questionsInRegister: questions.filter((q) => q.inRegister).length,
  actions: actions.length,
  domains: domainOrder.length,
  bronnen: new Set(indicators.map((i) => i.bron).filter(Boolean)).size,
};

/** Distinct dashboards/platforms, most frequent first. */
export const bronOptions: { value: string; count: number }[] = (() => {
  const counts = new Map<string, number>();
  for (const i of indicators) if (i.bron) counts.set(i.bron, (counts.get(i.bron) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, count }));
})();
