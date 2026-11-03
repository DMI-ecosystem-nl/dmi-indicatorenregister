import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CoverageBar, CoverageLegend } from "@/components/coverage-bar";
import { DomainBadge } from "@/components/domain-badge";
import { LineList } from "@/components/field";
import { IndicatorCard } from "@/components/indicator-card";
import { Container, PageHeader } from "@/components/page-header";
import { actielijnen, geschiktheidLabels, geschiktheidOrder, geschiktheidColors } from "@/data/taxonomy";
import { actionsOf, getQuestionBySlug, indicatorsOf, meta, questions } from "@/lib/selectors";

export function generateStaticParams() {
  return questions.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: PageProps<"/vragen/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const q = getQuestionBySlug(slug);
  return q ? { title: `${q.id} ${q.title}` } : {};
}

export default function VraagPage({ params }: PageProps<"/vragen/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <VraagPageContent params={params} />
    </Suspense>
  );
}

async function VraagPageContent({ params }: { params: PageProps<"/vragen/[slug]">["params"] }) {
  const { slug } = await params;
  const q = getQuestionBySlug(slug);
  if (!q) notFound();
  const items = indicatorsOf(q);
  const acts = actionsOf(q.blauwdruk);

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/vragen", label: "Monitoringsvragen" }, { label: q.id }]}
        eyebrow={`Monitoringsvraag ${q.id}${q.wensenlijst ? " · wensenlijst" : ""}`}
        title={q.title}
        description={q.kernvraag && q.kernvraag !== q.title ? q.kernvraag : undefined}
      >
        <div className="flex flex-wrap gap-2">
          {q.domains.map((c) => (
            <DomainBadge key={c} code={c} link short={false} />
          ))}
        </div>
      </PageHeader>
      <Container className="grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div className="max-w-xl space-y-2">
            <CoverageBar counts={q.counts} height={10} />
            <CoverageLegend counts={q.counts} />
          </div>
          {geschiktheidOrder.map((g) => {
            const group = items.filter((i) => i.geschiktheid === g);
            if (!group.length) return null;
            return (
              <section key={g}>
                <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold text-dmi-navy">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: geschiktheidColors[g] }} />
                  {geschiktheidLabels[g]}
                  <span className="text-sm font-normal text-muted-foreground">({group.length})</span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.map((i) => (
                    <IndicatorCard key={i.slug} indicator={i} />
                  ))}
                </div>
              </section>
            );
          })}
          <p className="text-xs text-muted-foreground">
            Opname in het register volgt versie v{meta.pdfVersion}; ‘Beperkt’ en ‘Niet’ zijn beoordeelde
            kandidaten die (nog) niet geschikt zijn. Open een indicator voor de toelichting.
          </p>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {q.variaties && (
            <div className="rounded-xl border border-border bg-white p-5 shadow-dmi-sm">
              <h2 className="dmi-tag text-[10px] text-muted-foreground">Variaties op de vraag</h2>
              <LineList text={q.variaties} className="mt-2" />
            </div>
          )}
          <div className="rounded-xl border border-border bg-white p-5 shadow-dmi-sm">
            <h2 className="dmi-tag text-[10px] text-muted-foreground">
              Blauwdruk G40-acties ({acts.length})
            </h2>
            {acts.length ? (
              <ul className="mt-3 space-y-3">
                {acts.map((a) => (
                  <li key={a.id}>
                    <Link href={`/blauwdruk/${a.slug}`} className="group block">
                      <span className="dmi-tag text-[11px] text-[#7a5410]">
                        {a.id} · {actielijnen[a.actielijn].title}
                      </span>
                      <span className="mt-0.5 line-clamp-3 block text-sm text-dmi-navy group-hover:underline">{a.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Geen gekoppelde acties.</p>
            )}
          </div>
        </aside>
      </Container>
    </>
  );
}
