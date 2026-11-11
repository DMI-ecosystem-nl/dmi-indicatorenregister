import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DomainBadge } from "@/components/domain-badge";
import { LineList, Prose } from "@/components/field";
import { Container, PageHeader } from "@/components/page-header";
import { QuestionBlock } from "@/components/question-block";
import { actielijnen } from "@/data/taxonomy";
import { actions, getActionBySlug, indicatorsOf, questionsOfAction } from "@/lib/selectors";

export function generateStaticParams() {
  return actions.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blauwdruk/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = getActionBySlug(slug);
  return a ? { title: `Actie ${a.id}`, description: a.text.slice(0, 160) } : {};
}

export default function ActiePage({ params }: PageProps<"/blauwdruk/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ActiePageContent params={params} />
    </Suspense>
  );
}

async function ActiePageContent({ params }: { params: PageProps<"/blauwdruk/[slug]">["params"] }) {
  const { slug } = await params;
  const a = getActionBySlug(slug);
  if (!a) notFound();
  const idx = actions.findIndex((x) => x.id === a.id);
  const prev = actions[idx - 1];
  const next = actions[idx + 1];
  const qs = questionsOfAction(a);

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/blauwdruk", label: "Blauwdruk G40" }, { label: `Actie ${a.id}` }]}
        eyebrow={`Actielijn ${a.actielijn} · ${actielijnen[a.actielijn].title}`}
        title={`Actie ${a.id}`}
      >
        <blockquote className="max-w-3xl border-l-4 border-dmi-gold bg-white/70 py-3 pl-4 pr-3 text-base leading-relaxed text-dmi-navy">
          {a.text}
        </blockquote>
        {a.domains.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {a.domains.map((c) => (
              <DomainBadge key={c} code={c} link />
            ))}
          </div>
        )}
      </PageHeader>
      <Container className="space-y-10 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["I · Doelen en ambities", a.doelen, false],
            ["II · Hoe adresseren we dit?", a.aanpak, false],
            ["III · Benodigde data en metrieken", a.dataSamengevat ?? a.benodigdeData, true],
          ].map(([label, text, list]) => (
            <div key={label as string} className="rounded-xl border border-border bg-white p-5 shadow-dmi-sm">
              <h2 className="dmi-tag mb-2 text-[10px] text-dmi-blue">Vraag {label as string}</h2>
              {text ? (
                list ? <LineList text={text as string} /> : <Prose text={text as string} />
              ) : (
                <p className="text-sm text-muted-foreground">Niet uitgewerkt.</p>
              )}
            </div>
          ))}
        </section>

        <section>
          <h2 className="mb-1 font-heading text-xl font-semibold text-dmi-navy">
            Monitoringsvragen en indicatoren ({qs.length})
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Deze monitoringsvragen zijn afgeleid uit actie {a.id}.
          </p>
          <div className="space-y-4">
            {qs.length ? (
              qs.map((q) => <QuestionBlock key={q.id} question={q} items={indicatorsOf(q)} />)
            ) : (
              <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                Voor deze actie staat nog geen indicator in het register.
              </p>
            )}
          </div>
        </section>

        <nav className="flex items-center justify-between border-t border-border pt-6 text-sm">
          {prev ? (
            <Link href={`/blauwdruk/${prev.slug}`} className="inline-flex items-center gap-1 text-dmi-blue hover:underline">
              <ChevronLeft className="size-4" /> Actie {prev.id}
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/blauwdruk/${next.slug}`} className="inline-flex items-center gap-1 text-dmi-blue hover:underline">
              Actie {next.id} <ChevronRight className="size-4" />
            </Link>
          )}
        </nav>
      </Container>
    </>
  );
}
