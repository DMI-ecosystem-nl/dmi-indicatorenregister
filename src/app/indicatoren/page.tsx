import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalogue } from "@/components/catalogue";
import { Container, PageHeader } from "@/components/page-header";
import { meta, totals } from "@/lib/selectors";

export const metadata: Metadata = { title: "Indicatoren" };

export default function IndicatorenPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Indicatoren" }]}
        eyebrow="Catalogus"
        title="Indicatoren"
        description={
          <>
            Het register v{meta.version} bevat {totals.indicators} indicatoren: {totals.counts.goed} geschikt en{" "}
            {totals.counts.gewenst} gewenst. Filter op geschiktheid, domein, bron, schaalniveau, type of frequentie.
          </>
        }
      />
      <Container className="pt-6">
        <Suspense fallback={<p className="py-10 text-sm text-muted-foreground">Catalogus laden…</p>}>
          <Catalogue />
        </Suspense>
      </Container>
    </>
  );
}
