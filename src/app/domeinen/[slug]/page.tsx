import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CoverageBar, CoverageLegend } from "@/components/coverage-bar";
import { IndicatorRow } from "@/components/indicator-row";
import { DomainIcon } from "@/components/domain-icon";
import { Container, PageHeader } from "@/components/page-header";
import { QuestionBlock } from "@/components/question-block";
import { domainBySlug, domainOrder, domains } from "@/data/taxonomy";
import { countByGeschiktheid, indicators, indicatorsOf, questionsOfDomain } from "@/lib/selectors";

export function generateStaticParams() {
  return domainOrder.map((c) => ({ slug: domains[c].slug }));
}

export async function generateMetadata({ params }: PageProps<"/domeinen/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = domainBySlug(slug);
  return d ? { title: d.label, description: d.description } : {};
}

export default function DomeinPage({ params }: PageProps<"/domeinen/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DomeinPageContent params={params} />
    </Suspense>
  );
}

async function DomeinPageContent({ params }: { params: PageProps<"/domeinen/[slug]">["params"] }) {
  const { slug } = await params;
  const d = domainBySlug(slug);
  if (!d) notFound();
  const items = indicators.filter((i) => i.domain === d.code);
  const counts = countByGeschiktheid(items);
  // Relevant to this domain (✓ in the register), with another hoofddomein.
  const related = indicators.filter((i) => i.domain !== d.code && i.domains.includes(d.code));
  const qs = questionsOfDomain(d.code)
    .map((q) => ({ q, items: indicatorsOf(q).filter((i) => i.domain === d.code) }))
    .sort((a, b) => a.q.id.localeCompare(b.q.id));

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/domeinen", label: "Domeinen" }, { label: d.label }]}
        eyebrow={
          <span className="inline-flex items-center gap-1.5">
            <DomainIcon code={d.code} className="size-3.5" /> Domein {d.code}
          </span>
        }
        title={d.label}
        description={d.description}
      >
        <div className="flex max-w-xl flex-col gap-2">
          <CoverageBar counts={counts} height={10} />
          <CoverageLegend counts={counts} />
          <p className="text-sm text-muted-foreground">
            <strong className="text-dmi-navy">{items.length}</strong> indicatoren met dit hoofddomein, verdeeld over{" "}
            {qs.length} monitoringsvragen.{related.length > 0 && ` Nog ${related.length} indicatoren zijn ook relevant voor dit domein.`}{" "}
            <Link href={`/indicatoren?domein=${d.code.toLowerCase()}`} className="text-dmi-blue hover:underline">
              Bekijk in de catalogus
            </Link>
          </p>
        </div>
      </PageHeader>
      <Container className="py-8">
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-dmi-navy">
            Monitoringsvragen ({qs.length})
          </h2>
          {qs.map(({ q, items }) => (
            <QuestionBlock key={q.id} question={q} items={items} />
          ))}
        </div>
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading text-xl font-semibold text-dmi-navy">
              Ook relevant voor dit domein ({related.length})
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Deze indicatoren hebben een ander hoofddomein, maar zijn in het register ook aangevinkt voor {d.label}.
            </p>
            <div className="mt-4 grid gap-x-4 gap-y-1 rounded-xl border border-border bg-white p-2 shadow-dmi-sm md:grid-cols-2">
              {related.map((i) => (
                <IndicatorRow key={i.slug} indicator={i} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
