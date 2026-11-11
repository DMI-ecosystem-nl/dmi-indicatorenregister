import type { Metadata } from "next";
import Link from "next/link";
import { FileSpreadsheet, FileText, Mail } from "lucide-react";
import { Container, PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/format";
import { indicators, meta, totals } from "@/lib/selectors";

/** Count indicators with at least one change of this kind in this version. */
function changed(version: string, field: string) {
  return indicators.filter((i) => i.changes.some((c) => c.version === version && c.field === field)).length;
}

export const metadata: Metadata = { title: "Over dit register" };

export default function OverPage() {
  const v = meta.version;
  const pv = meta.pdfVersion;
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Over" }]}
        eyebrow="Colofon"
        title="Over dit register"
        description="Op deze website kun je het DMI indicatorenregister doorzoeken en delen. De inhoud is een werkbaar concept. De DMI Indicatoren community toetst de inhoud dit najaar."
      />
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold text-dmi-navy">Wat staat erin?</h2>
            {meta.intro.split("\n\n").map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold text-dmi-navy">Status</h2>
            <p>
              Versie <strong>v{meta.version}</strong> ({formatDate(meta.versionDate)}) is een concept. Versie 1.0 van het
              register en het dashboard komt op <strong>2 december 2026</strong>. In 2027 volgen de inrichting van
              organisatie en beheer en het testen in de praktijk.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold text-dmi-navy">Verwerking van de bronnen</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                De uitdraai v{v} ({formatDate(meta.versionDate)}) bepaalt welke indicatoren ‘Geschikt’ zijn (in de bron:
                ‘Goed’). Dat zijn er {totals.counts.goed}. Hieruit komen ook de registercodes (A01…) en de metadata:
                beheerder, meetmethode, normen, type data, dekking en model of meting.
              </li>
              <li>
                De printout v{pv} ({formatDate(meta.pdfDate)}) bepaalt welke indicatoren ‘Gewenst’ zijn. Dat zijn er{" "}
                {totals.counts.gewenst}.
              </li>
              <li>
                Indicatoren met ‘Beperkt’ of ‘Niet’, en eerder geschikte indicatoren die niet in de uitdraai v{v} staan,
                zijn niet opgenomen. In totaal zijn {meta.assessedCount} indicatoren beoordeeld.
              </li>
              <li>
                De toelichting op de beoordeling, de Blauwdruk G40-vertaling en de monitoringsvragen komen uit het
                Excel-register v{meta.excelVersion} ({formatDate(meta.excelDate)}).
              </li>
              <li>
                Wijzigingen bij de indicatoren in het register. In de printout v{pv} ({formatDate(meta.pdfDate)}):{" "}
                {changed(pv, "domain")} naar een ander domein verplaatst. In v{v}: {changed(v, "added")} toegevoegd,{" "}
                {changed(v, "geschiktheid")} opgewaardeerd naar ‘Geschikt’, {changed(v, "domain")} naar een ander domein
                verplaatst en {changed(v, "name")} hernoemd.
              </li>
              <li>Elke wijziging staat op de pagina van de indicator.</li>
              <li>
                Sommige indicator-ID’s komen in de bron twee keer voor. Deze site geeft ze een uniek webadres.
              </li>
              <li>Persoonsnamen en interne notities uit de werksessies staan niet op deze site.</li>
            </ul>
          </section>
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-5 text-sm shadow-dmi-sm">
            <h2 className="dmi-tag text-[10px] text-muted-foreground">Contact</h2>
            <p className="mt-2">Heb je een vraag of opmerking over het register? Mail het DMI-team.</p>
            <a
              href="mailto:dmiteam@minienw.nl?subject=DMI%20indicatorenregister"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-dmi-navy px-3 py-2 font-medium text-white hover:bg-dmi-blue"
            >
              <Mail className="size-4" /> Mail het DMI-team
            </a>
            <p className="mt-2 text-xs text-muted-foreground">dmiteam@minienw.nl</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-5 shadow-dmi-sm">
            <h2 className="dmi-tag text-[10px] text-muted-foreground">In cijfers</h2>
            <dl className="mt-3 grid grid-cols-2 gap-4">
              {[
                [totals.indicators, "in register"],
                [meta.assessedCount, "beoordeeld"],
                [totals.questions, "monitoringsvragen"],
                [totals.actions, "G40-acties"],
                [totals.bronnen, "bronnen"],
                [totals.domains, "domeinen"],
              ].map(([n, l]) => (
                <div key={l as string}>
                  <dt className="font-heading text-2xl font-semibold text-dmi-navy tabular-nums">{n}</dt>
                  <dd className="text-xs text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border border-border bg-white p-5 shadow-dmi-sm">
            <h2 className="dmi-tag text-[10px] text-muted-foreground">Bronbestanden</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {meta.sources.map((s) => {
                const Icon = s.format === "pdf" ? FileText : FileSpreadsheet;
                return (
                  <li key={s.version} className="flex gap-2">
                    <Icon className={s.format === "pdf" ? "size-4 shrink-0 text-[#a23b38]" : "size-4 shrink-0 text-[#2f7d4f]"} />
                    <span>
                      {s.title} v{s.version}
                      <span className="block text-xs text-muted-foreground">
                        {formatDate(s.date)} · {s.role}
                      </span>
                    </span>
                  </li>
                );
              })}
              <li className="flex gap-2"><FileText className="size-4 shrink-0 text-dmi-blue" /> CPT-koppeling user stories</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-white p-5 text-sm shadow-dmi-sm">
            <h2 className="dmi-tag text-[10px] text-muted-foreground">Meer weten?</h2>
            <p className="mt-2">
              Lees over de rol van het register in het{" "}
              <Link href="/ecosysteem" className="text-dmi-blue hover:underline">DMI-ecosysteem</Link> of bekijk{" "}
              <a href="https://dmi-ecosysteem.nl" target="_blank" rel="noopener noreferrer" className="text-dmi-blue hover:underline">
                dmi-ecosysteem.nl
              </a>.
            </p>
          </div>
        </aside>
      </Container>
    </>
  );
}
