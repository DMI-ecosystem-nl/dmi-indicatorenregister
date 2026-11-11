import Link from "next/link";
import type { Metadata } from "next";
import { BlueprintMatrix, type MatrixAction, type MatrixRow } from "@/components/blueprint-matrix";
import { Container, PageHeader } from "@/components/page-header";
import { domainOrder } from "@/data/taxonomy";
import { actions, bestGeschiktheid, indicatorsOf, questions, questionsOfAction } from "@/lib/selectors";

export const metadata: Metadata = { title: "Dekkingsmatrix Blauwdruk G40" };

export default function MatrixPage() {
  const rows: MatrixRow[] = questions
    .filter((q) => q.blauwdruk.length > 0)
    .map((q) => {
      const items = indicatorsOf(q);
      return {
        id: q.id,
        slug: q.slug,
        title: q.title,
        domain: q.domains[0],
        best: bestGeschiktheid(items),
        codes: q.blauwdruk,
        indicators: items.map((i) => ({
          slug: i.slug,
          code: i.indeling ?? i.id,
          name: i.name,
          geschiktheid: i.geschiktheid,
        })),
      };
    })
    .sort((a, b) => domainOrder.indexOf(a.domain) - domainOrder.indexOf(b.domain) || a.id.localeCompare(b.id));

  const cols: MatrixAction[] = actions.map((a) => ({
    id: a.id,
    slug: a.slug,
    actielijn: a.actielijn,
    text: a.text,
    best: bestGeschiktheid(questionsOfAction(a).flatMap(indicatorsOf)),
  }));
  const gaps = cols.filter((c) => c.best !== "goed");

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/blauwdruk", label: "Blauwdruk G40" }, { label: "Dekkingsmatrix" }]}
        eyebrow="Analyse"
        title="Dekkingsmatrix: G40-acties × monitoringsvragen"
        description={
          <>
            Elke kolom is een actie uit de Blauwdruk G40, elke rij een monitoringsvraag. Een gekleurde cel betekent
            dat de vraag uit die actie komt. De kleur toont de beste beschikbare indicator.{" "}
            {gaps.length} van de {cols.length} acties hebben nog geen geschikte indicator.
          </>
        }
      />
      <Container className="py-8">
        <p className="mb-4 rounded-lg border border-dmi-gold/50 bg-[#fdf8ec] px-3 py-2 text-sm text-dmi-navy md:hidden">
          De matrix is breed. Bekijk deze op een groter scherm, of open de{" "}
          <Link href="/blauwdruk" className="font-medium text-dmi-blue underline">lijst met acties</Link>.
        </p>
        <BlueprintMatrix actions={cols} rows={rows} />
      </Container>
    </>
  );
}
