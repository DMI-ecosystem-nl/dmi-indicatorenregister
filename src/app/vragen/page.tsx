import type { Metadata } from "next";
import { CoverageLegend } from "@/components/coverage-bar";
import { Container, PageHeader } from "@/components/page-header";
import { QuestionList } from "@/components/question-list";
import { questions, totals } from "@/lib/selectors";

export const metadata: Metadata = { title: "Monitoringsvragen" };

export default function VragenPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Monitoringsvragen" }]}
        eyebrow="Ingang 3 · Monitoringsvragen"
        title="Wat willen we weten?"
        description={
          <>
            De acties uit de Blauwdruk G40 zijn vertaald naar monitoringsvragen. Hier staan de{" "}
            {totals.questions} vragen met minstens één indicator in het register. Vragen vanaf V.700 komen uit het
            aanvullende wensenlijstje.
          </>
        }
      >
        <CoverageLegend />
      </PageHeader>
      <Container className="py-8">
        <QuestionList questions={questions} />
      </Container>
    </>
  );
}
