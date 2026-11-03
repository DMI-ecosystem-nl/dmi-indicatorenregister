import { actions, indicators, questions } from "@/lib/selectors";

export interface SearchItem {
  kind: "indicator" | "vraag" | "actie";
  href: string;
  title: string;
  code: string;
  sub: string;
}

/** Slim index for the ⌘K palette — built on the server, shipped once. */
export function buildSearchIndex(): SearchItem[] {
  return [
    ...questions.map((q) => ({
      kind: "vraag" as const,
      href: `/vragen/${q.slug}`,
      title: q.title,
      code: q.id,
      sub: `${q.indicatorSlugs.length} indicatoren`,
    })),
    ...actions.map((a) => ({
      kind: "actie" as const,
      href: `/blauwdruk/${a.slug}`,
      title: a.text.length > 110 ? `${a.text.slice(0, 110)}…` : a.text,
      code: a.id,
      sub: `Blauwdruk G40 · actielijn ${a.actielijn}`,
    })),
    ...indicators.map((i) => ({
      kind: "indicator" as const,
      href: `/indicatoren/${i.slug}`,
      title: i.name,
      code: i.indeling ?? i.id,
      sub: [i.bron, i.geschiktheid].filter(Boolean).join(" · "),
    })),
  ];
}
