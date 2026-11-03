import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CoverageBar, CoverageLegend } from "@/components/coverage-bar";
import { DomainIcon } from "@/components/domain-icon";
import { Container, PageHeader } from "@/components/page-header";
import { domains } from "@/data/taxonomy";
import { domainStats, totals } from "@/lib/selectors";

export const metadata: Metadata = { title: "Domeinen" };

export default function DomeinenPage() {
  const stats = domainStats();
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Domeinen" }]}
        eyebrow="Ingang 1 · DMI-domeinen"
        title="Indicatoren per DMI-domein"
        description="Het register is ingedeeld in acht DMI-domeinen plus een domein met contextgegevens. Per domein zie je de monitoringsvragen en de indicatoren die ze beantwoorden."
      >
        <CoverageLegend counts={totals.allCounts} />
      </PageHeader>
      <Container className="py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => {
            const d = domains[s.code];
            return (
              <Link
                key={s.code}
                href={`/domeinen/${d.slug}`}
                className="group flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-dmi-sm transition-all hover:-translate-y-0.5 hover:border-dmi-blue-200 hover:shadow-dmi-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-dmi-navy text-white">
                    <DomainIcon code={s.code} className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="dmi-tag text-[10px] text-muted-foreground">Domein {s.code}</p>
                    <h2 className="font-heading text-lg font-semibold leading-tight text-dmi-navy">{d.label}</h2>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{d.description}</p>
                <div className="mt-auto space-y-2">
                  <CoverageBar counts={s.counts} />
                  <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                    <span>
                      <strong className="text-base text-dmi-navy tabular-nums">{s.register}</strong> in register ·{" "}
                      {s.total} beoordeeld · {s.questions} vragen
                    </span>
                    <ArrowRight className="size-4 text-dmi-blue transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </>
  );
}
