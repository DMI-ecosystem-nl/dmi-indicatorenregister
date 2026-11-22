import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, FileText, Ruler, Target } from "lucide-react";
import { BackLink } from "@/components/back-link-server";
import { BlauwdrukChip } from "@/components/blauwdruk-chip";
import { DomainBadge } from "@/components/domain-badge";
import { Field, Prose } from "@/components/field";
import { GeschiktheidBadge } from "@/components/geschiktheid-badge";
import { IndicatorCard } from "@/components/indicator-card";
import { Container } from "@/components/page-header";
import { fieldHelp, fieldLabels, type FieldKey } from "@/data/content/field-help";
import { domains, indicatorTypeLabel } from "@/data/taxonomy";
import {
  getIndicator,
  getQuestion,
  hostOf,
  indicators,
  indicatorsOf,
} from "@/lib/selectors";

export function generateStaticParams() {
  return indicators.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/indicatoren/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const i = getIndicator(slug);
  return i ? { title: i.name, description: `${i.id} · ${domains[i.domain].label} · ${i.bron ?? ""}` } : {};
}

const jaNee = (v: string | null) =>
  v ? { ja: "Ja", nee: "Nee", beperkt: "Beperkt", onduidelijk: "Onduidelijk" }[v] ?? v : null;

const capitalise = (v: string | null) => (v ? v[0].toUpperCase() + v.slice(1) : null);

/** A metadata field labelled with its register column name, with an explanation. */
function MetaField({ k, children }: { k: FieldKey; children: React.ReactNode }) {
  return (
    <Field label={fieldLabels[k]} help={fieldHelp[k]}>
      {children}
    </Field>
  );
}

export default function IndicatorPage({ params }: PageProps<"/indicatoren/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <IndicatorPageContent params={params} />
    </Suspense>
  );
}

async function IndicatorPageContent({ params }: { params: PageProps<"/indicatoren/[slug]">["params"] }) {
  const { slug } = await params;
  const i = getIndicator(slug);
  if (!i) notFound();
  const question = getQuestion(i.vraagId);
  const siblings = question ? indicatorsOf(question).filter((s) => s.slug !== i.slug) : [];
  const metaFields = [i.dataverzamelaar, i.type, i.frequentie, i.meestRecentJaar, i.laagsteSchaal, i.openbaar];
  const sparse = metaFields.filter((v) => v === null).length >= 4;
  const host = hostOf(i.bronUrl);
  const [hoofd, ...related] = i.domains;

  return (
    <>
      <section className="border-b border-border bg-dmi-blue-050 dmi-grid-bg">
        <Container className="pb-8 pt-6">
          <BackLink fallback="/indicatoren" label="Terug naar indicatoren" />
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="dmi-tag text-[11px] text-muted-foreground">{i.id}</span>
            <GeschiktheidBadge value={i.geschiktheid} size="md" />
          </div>
          <h1 className="mt-3 max-w-4xl font-heading text-3xl font-semibold tracking-tight text-dmi-navy sm:text-4xl">
            {i.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <DomainBadge code={hoofd} link short={false} />
            {related.length > 0 && (
              <>
                <span className="ml-1 text-xs text-muted-foreground">Ook relevant voor</span>
                {related.map((c) => (
                  <DomainBadge key={c} code={c} link />
                ))}
              </>
            )}
          </div>
          {question && (
            <Link
              href={`/vragen/${question.slug}`}
              className="mt-5 flex max-w-2xl items-start gap-3 rounded-xl border border-border bg-white p-3 shadow-dmi-sm hover:border-dmi-blue-200"
            >
              <span className="dmi-tag mt-0.5 text-[10px] text-dmi-blue">{question.id}</span>
              <span className="text-sm">
                <span className="block text-xs text-muted-foreground">Beantwoordt monitoringsvraag</span>
                <span className="font-medium text-dmi-navy">{question.title}</span>
              </span>
            </Link>
          )}
        </Container>
      </section>

      <Container className="grid gap-8 py-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {i.beschrijving && (
            <section>
              <h2 className="mb-3 font-heading text-lg font-semibold text-dmi-navy">Beschrijving</h2>
              <div className="flex gap-3 rounded-xl border border-border bg-white p-4">
                <FileText className="mt-0.5 size-4 shrink-0 text-dmi-blue" aria-hidden />
                <Prose text={i.beschrijving} className="min-w-0" />
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 font-heading text-lg font-semibold text-dmi-navy">Metadata</h2>
            {sparse && (
              <p className="mb-3 rounded-lg bg-dmi-blue-050 px-3 py-2 text-xs text-muted-foreground">
                {i.geschiktheid === "gewenst"
                  ? "Deze indicator is gewenst: er is nog geen complete of landelijke bron. Daarom ontbreekt een deel van de metadata."
                  : "De metadata van deze indicator is nog niet compleet."}
              </p>
            )}
            <dl className="grid gap-x-6 gap-y-5 rounded-xl border border-border bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
              <MetaField k="dashboard">{i.bron}</MetaField>
              <MetaField k="indicatorType">
                {i.type !== null ? `${i.type}. ${indicatorTypeLabel(i.type)}` : null}
              </MetaField>
              <MetaField k="modelMeting">{i.modelMeting}</MetaField>
              <MetaField k="openbaar">{jaNee(i.openbaar)}</MetaField>
              <MetaField k="vrijGebruik">{jaNee(i.vrijGebruik)}</MetaField>
              <MetaField k="voorwaarden">{i.voorwaarden}</MetaField>
              <MetaField k="beheerder">{i.beheerder}</MetaField>
              <MetaField k="frequentie">{capitalise(i.frequentie)}</MetaField>
              <MetaField k="meestRecentJaar">
                {i.meestRecentJaar === "onduidelijk" ? "Onduidelijk" : i.meestRecentJaar}
              </MetaField>
              <MetaField k="typeData">{i.typeData}</MetaField>
              <MetaField k="laagsteSchaal">{i.laagsteSchaal}</MetaField>
              <MetaField k="dekking">{i.dekking}</MetaField>
              <MetaField k="historie">{jaNee(i.historie)}</MetaField>
              <MetaField k="dataverzamelaar">{i.dataverzamelaar}</MetaField>
              <MetaField k="prognose">{i.prognose}</MetaField>
              <MetaField k="eenheid">{i.eenheid}</MetaField>
            </dl>
          </section>

          {(i.meetmethode || i.norm) && (
            <section className="space-y-3">
              <h2 className="font-heading text-lg font-semibold text-dmi-navy">Meetmethode en norm</h2>
              {i.meetmethode && (
                <div className="flex gap-3 rounded-xl border border-border bg-white p-4">
                  <Ruler className="mt-0.5 size-4 shrink-0 text-dmi-blue" aria-hidden />
                  <dl className="min-w-0">
                    <MetaField k="meetmethode">
                      <Prose text={i.meetmethode} />
                    </MetaField>
                  </dl>
                </div>
              )}
              {i.norm && (
                <div className="flex gap-3 rounded-xl border border-border bg-white p-4">
                  <Target className="mt-0.5 size-4 shrink-0 text-dmi-blue" />
                  <dl className="grid min-w-0 flex-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                    <MetaField k="normwaarde">{i.norm.waarde}</MetaField>
                    <MetaField k="normJaar">{i.norm.jaar}</MetaField>
                    <MetaField k="normBron">{i.norm.bron}</MetaField>
                  </dl>
                </div>
              )}
            </section>
          )}

          {siblings.length > 0 && question && (
            <section>
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <h2 className="font-heading text-lg font-semibold text-dmi-navy">
                  Andere indicatoren voor deze vraag
                </h2>
                <Link href={`/vragen/${question.slug}`} className="text-sm text-dmi-blue hover:underline">
                  Alle {question.indicatorSlugs.length} bekijken
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {siblings.slice(0, 6).map((s) => (
                  <IndicatorCard key={s.slug} indicator={s} showDomain={false} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-border bg-white p-5 shadow-dmi-sm">
            <h2 className="dmi-tag text-[10px] text-muted-foreground">Bron</h2>
            {i.bronUrl ? (
              <a
                href={i.bronUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-start gap-2 rounded-lg bg-dmi-navy px-3 py-2.5 text-sm font-medium text-white hover:bg-dmi-blue"
              >
                <ExternalLink className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span className="min-w-0">
                  <span className="block">{i.bron ? `Open ${i.bron}` : "Open de bron"}</span>
                  {host && <span className="block truncate text-xs font-normal text-white/70">{host}</span>}
                </span>
              </a>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {i.bron ? `${i.bron}. ` : ""}Er is nog geen link naar de brondata.
              </p>
            )}
          </div>
          {i.blauwdruk.length > 0 && (
            <div className="rounded-xl border border-border bg-white p-5 shadow-dmi-sm">
              <h2 className="dmi-tag text-[10px] text-muted-foreground">Blauwdruk G40-acties</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {i.blauwdruk.map((c) => (
                  <BlauwdrukChip key={c} code={c} />
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Gekoppeld aan {i.blauwdruk.length} {i.blauwdruk.length === 1 ? "actie" : "acties"} uit de Blauwdruk G40.
              </p>
            </div>
          )}
        </aside>
      </Container>
    </>
  );
}
