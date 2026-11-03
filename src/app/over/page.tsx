import type { Metadata } from "next";
import Link from "next/link";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Container, PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/format";
import { indicators, meta, totals } from "@/lib/selectors";

export const metadata: Metadata = { title: "Over dit register" };

export default function OverPage() {
  const moved = indicators.filter((i) => i.domainV09).length;
  const changed = indicators.filter((i) => i.geschiktheidV09).length;
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
              Versie <strong>v{meta.pdfVersion}</strong> ({formatDate(meta.pdfDate)}) is een concept. Versie 1.0 van het
              register en het dashboard komt op <strong>2 december 2026</strong>. In 2027 volgen de inrichting van
              organisatie en beheer en het testen in de praktijk.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold text-dmi-navy">Verwerking van de bronnen</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                De metadata komt uit het Excel-register v{meta.excelVersion} ({formatDate(meta.excelDate)}). De selectie,
                indelingscodes (A01…) en geschiktheid volgen de nieuwere printout v{meta.pdfVersion}.
              </li>
              <li>
                In v{meta.pdfVersion} zijn {moved} indicatoren naar een ander DMI-domein verplaatst en is bij {changed}{" "}
                {changed === 1 ? "indicator" : "indicatoren"} de geschiktheid aangepast; dit staat op de indicatorpagina.
              </li>
              <li>
                Sommige indicator-ID’s komen in de bron twee keer voor. Deze site geeft ze een uniek webadres.
              </li>
              <li>Persoonsnamen en interne notities uit de werksessies staan niet op deze site.</li>
            </ul>
          </section>
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-5 shadow-dmi-sm">
            <h2 className="dmi-tag text-[10px] text-muted-foreground">In cijfers</h2>
            <dl className="mt-3 grid grid-cols-2 gap-4">
              {[
                [totals.register, "in register"],
                [totals.indicators, "beoordeeld"],
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
              <li className="flex gap-2"><FileSpreadsheet className="size-4 shrink-0 text-[#2f7d4f]" /> DMI Indicatorenregister – werkbaar concept v{meta.excelVersion}</li>
              <li className="flex gap-2"><FileText className="size-4 shrink-0 text-[#a23b38]" /> DMI indicatorenregister v{meta.pdfVersion} concept</li>
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
