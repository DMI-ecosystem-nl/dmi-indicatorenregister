import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalogue } from "@/components/catalogue";
import { Container, PageHeader } from "@/components/page-header";
import { totals } from "@/lib/selectors";

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
            {totals.register} indicatoren in het register (Goed of Gewenst), gekozen uit {totals.indicators}{" "}
            beoordeelde indicatoren. Kies <em>Alle beoordeelde</em> om ook de niet-opgenomen kandidaten te zien,
            met de reden.
          </>
        }
      />
      <Container className="pt-2">
        <Suspense fallback={<p className="py-10 text-sm text-muted-foreground">Catalogus laden…</p>}>
          <Catalogue />
        </Suspense>
      </Container>
    </>
  );
}
