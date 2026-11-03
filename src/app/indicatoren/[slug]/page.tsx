import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Info, Lightbulb } from "lucide-react";
import { BackLink } from "@/components/back-link-server";
import { BlauwdrukChip } from "@/components/blauwdruk-chip";
import { DomainBadge } from "@/components/domain-badge";
import { Field } from "@/components/field";
import { GeschiktheidBadge } from "@/components/geschiktheid-badge";
import { IndicatorCard } from "@/components/indicator-card";
import { Container } from "@/components/page-header";
import {
  domains,
  geschiktheidLabels,
  indicatorTypeLabel,
  schaalLabels,
} from "@/data/taxonomy";
import {
  getIndicator,
  getQuestion,
  hostOf,
  indicators,
  indicatorsOf,
  meta,
  schaalOf,
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
  const siblings = question
    ? indicatorsOf(question)
        .filter((s) => s.slug !== i.slug)
        .sort((a, b) => Number(b.inRegister) - Number(a.inRegister))
    : [];
  const metaFields = [i.dataverzamelaar, i.type, i.frequentie, i.meestRecentJaar, i.schaalniveau, i.openbaar];
  const sparse = metaFields.filter((v) => v === null).length >= 4;
  const host = hostOf(i.bronUrl);
  const schaal = schaalOf(i);

  return (
    <>
      <section className="border-b border-border bg-dmi-blue-050 dmi-grid-bg">
        <Container className="pb-8 pt-6">
          <BackLink fallback="/indicatoren" label="Terug naar indicatoren" />
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="dmi-tag rounded bg-dmi-navy px-2 py-0.5 text-[11px] text-white">
              {i.indeling ?? i.id}
            </span>
            {i.indeling && <span className="dmi-tag text-[11px] text-muted-foreground">{i.id}</span>}
            <GeschiktheidBadge value={i.geschiktheid} size="md" />
            {i.inRegister ? (
              <span className="text-xs text-dmi-navy/70">Opgenomen in register v{meta.pdfVersion}</span>
            ) : (
              <span className="text-xs text-muted-foreground">Niet opgenomen in register v{meta.pdfVersion}</span>
            )}
          </div>
          <h1 className="mt-3 max-w-4xl font-heading text-3xl font-semibold tracking-tight text-dmi-navy sm:text-4xl">
            {i.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <DomainBadge code={i.domain} link short={false} />
            {i.domain2 && i.domain2 !== i.domain && <DomainBadge code={i.domain2} link />}
            {i.cluster && (
              <span className="rounded-md border border-border bg-white px-2 py-0.5 text-xs text-muted-foreground">
                {i.cluster}
              </span>
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
          {(i.toelichting || i.benodigdVoorGoed) && (
            <section className="space-y-3">
              <h2 className="font-heading text-lg font-semibold text-dmi-navy">Beoordeling</h2>
              {i.toelichting && (
                <div className="flex gap-3 rounded-xl border border-border bg-white p-4">
                  <Info className="mt-0.5 size-4 shrink-0 text-dmi-blue" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Toelichting geschiktheid ({geschiktheidLabels[i.geschiktheid]})
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{i.toelichting}</p>
                  </div>
                </div>
              )}
              {i.benodigdVoorGoed && (
                <div className="flex gap-3 rounded-xl border border-dmi-gold/50 bg-[#fdf6e6] p-4">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#8a5a12]" />
                  <div>
                    <p className="text-xs font-medium text-[#7a5410]">Benodigd voor ‘Goed’</p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{i.benodigdVoorGoed}</p>
                  </div>
                </div>
              )}
              {(i.geschiktheidV09 || i.domainV09) && (
                <div className="flex gap-3 rounded-xl border border-border bg-dmi-blue-050 p-4 text-sm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-dmi-blue" />
                  <p>
                    Gewijzigd in v{meta.pdfVersion}:{" "}
                    {i.geschiktheidV09 && (
                      <>
                        geschiktheid was <strong>{geschiktheidLabels[i.geschiktheidV09]}</strong>
                        {i.domainV09 ? "; " : "."}
                      </>
                    )}
                    {i.domainV09 && (
                      <>
                        domein was <strong>{i.domainV09}. {domains[i.domainV09].label}</strong>.
                      </>
                    )}
                  </p>
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="mb-3 font-heading text-lg font-semibold text-dmi-navy">Metadata</h2>
            {sparse && (
              <p className="mb-3 rounded-lg bg-dmi-blue-050 px-3 py-2 text-xs text-muted-foreground">
                De metadata van deze indicator is nog niet compleet; deze wordt richting versie 1.0 aangevuld.
              </p>
            )}
            <dl className="grid gap-x-6 gap-y-5 rounded-xl border border-border bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Dashboard / platform">{i.bron}</Field>
              <Field label="Dataverzamelaar">{i.dataverzamelaar}</Field>
              <Field label="Indicatortype">
                {i.type !== null ? `${i.type}. ${indicatorTypeLabel(i.type)}` : null}
              </Field>
              <Field label="Schaalniveau">
                {schaal !== "onbekend" ? (
                  <>
                    {schaalLabels[schaal]}
                    {i.laagsteSchaal && (
                      <span className="block text-xs text-muted-foreground">laagste: {i.laagsteSchaal}</span>
                    )}
                  </>
                ) : null}
              </Field>
              <Field label="Frequentie">{i.frequentie}</Field>
              <Field label="Meest recent jaar">{i.meestRecentJaar}</Field>
              <Field label="Historie">
                {i.historie === null ? null : i.historieNote ?? (i.historie ? "Ja" : "Nee")}
              </Field>
              <Field label="Prognose">{i.prognose}</Field>
              <Field label="Eenheid">{i.eenheid}</Field>
              <Field label="Openbaar toegankelijk">{jaNee(i.openbaar)}</Field>
              <Field label="Data vrij te gebruiken">{jaNee(i.vrijGebruik)}</Field>
              <Field label="Voorwaarden">{i.voorwaarden}</Field>
            </dl>
          </section>

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

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-border bg-white p-5 shadow-dmi-sm">
            <h2 className="dmi-tag text-[10px] text-muted-foreground">Bron</h2>
            {i.bronUrl ? (
              <a
                href={i.bronUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-start gap-2 rounded-lg bg-dmi-navy px-3 py-2.5 text-sm font-medium text-white hover:bg-dmi-blue"
              >
                <ExternalLink className="mt-0.5 size-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block">{i.bronLabel ?? "Open bron"}</span>
                  {host && <span className="block truncate text-xs font-normal text-white/70">{host}</span>}
                </span>
              </a>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {i.bronLabel ?? "Geen bronlink beschikbaar in het register."}
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
                Deze indicator draagt bij aan het monitoren van {i.blauwdruk.length}{" "}
                {i.blauwdruk.length === 1 ? "actie" : "acties"} uit de Blauwdruk G40.
              </p>
            </div>
          )}
        </aside>
      </Container>
    </>
  );
}
