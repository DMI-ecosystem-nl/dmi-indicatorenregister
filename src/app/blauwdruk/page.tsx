import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Grid3x3 } from "lucide-react";
import { CoverageBar, CoverageLegend } from "@/components/coverage-bar";
import { Container, PageHeader } from "@/components/page-header";
import { actielijnen, actielijnOrder } from "@/data/taxonomy";
import { actions, countByGeschiktheid, indicatorsOf, questionsOfAction } from "@/lib/selectors";

export const metadata: Metadata = { title: "Blauwdruk G40" };

export default function BlauwdrukPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Blauwdruk G40" }]}
        eyebrow="Ingang 2 · Beleid"
        title="Van Blauwdruk G40-actie naar indicator"
        description="De Blauwdruk G40 voor slimme duurzame verstedelijking en mobiliteitsvernieuwing bevat zes actielijnen. Elke actie is vertaald naar doelen, een aanpak en benodigde data, en vervolgens naar monitoringsvragen en indicatoren."
      >
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/blauwdruk/matrix"
            className="inline-flex items-center gap-2 rounded-lg bg-dmi-navy px-3 py-2 text-sm font-medium text-white hover:bg-dmi-blue"
          >
            <Grid3x3 className="size-4" /> Bekijk de dekkingsmatrix
          </Link>
          <CoverageLegend />
        </div>
      </PageHeader>
      <Container className="space-y-12 py-8">
        {actielijnOrder.map((l) => {
          const items = actions.filter((a) => a.actielijn === l);
          return (
            <section key={l} id={`actielijn-${l.toLowerCase()}`} aria-labelledby={`al-${l}`}>
              <div className="mb-4 flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-dmi-gold font-heading text-lg font-bold text-dmi-navy">
                  {l}
                </span>
                <div>
                  <h2 id={`al-${l}`} className="font-heading text-xl font-semibold text-dmi-navy">
                    Actielijn {l} · {actielijnen[l].title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{actielijnen[l].description}</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((a) => {
                  const qs = questionsOfAction(a);
                  const inds = qs.flatMap(indicatorsOf);
                  const counts = countByGeschiktheid(inds);
                  return (
                    <Link
                      key={a.id}
                      href={`/blauwdruk/${a.slug}`}
                      className="group flex flex-col gap-3 rounded-xl border border-border bg-white p-4 shadow-dmi-sm transition-all hover:-translate-y-0.5 hover:border-dmi-blue-200 hover:shadow-dmi-md"
                    >
                      <span className="dmi-tag text-xs font-medium text-[#7a5410]">{a.id}</span>
                      <p className="line-clamp-4 text-sm text-dmi-navy">{a.text}</p>
                      <div className="mt-auto space-y-1.5">
                        <CoverageBar counts={counts} height={6} />
                        <p className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                          <span>
                            {qs.length} vragen · {counts.goed + counts.gewenst} geschikte indicatoren
                          </span>
                          <ArrowRight className="size-3.5 text-dmi-blue transition-transform group-hover:translate-x-0.5" />
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
        <p className="text-xs text-muted-foreground">
          De titels van de actielijnen zijn werktitels; het register bevat alleen de letter.
        </p>
      </Container>
    </>
  );
}
