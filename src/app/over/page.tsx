import type { Metadata } from "next";
import Link from "next/link";
import { FileSpreadsheet, FileText, Mail } from "lucide-react";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { Container, PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/format";
import { meta, totals } from "@/lib/selectors";

export const metadata: Metadata = { title: "Over dit register" };

export default function OverPage() {
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
                Alle indicatoren komen uit de uitdraai van het register, versie {meta.version} (
                {formatDate(meta.versionDate)}). Daarin staan {totals.counts.goed} geschikte en{" "}
                {totals.counts.gewenst} gewenste indicatoren.
              </li>
              <li>
                Uit dezelfde uitdraai komen per indicator de beschrijving, de link naar de brondata, het hoofddomein en
                de andere relevante domeinen, de koppeling met de Blauwdruk G40 en de metadata.
              </li>
              <li>
                De Blauwdruk G40-vertaling, de volledige formulering van de monitoringsvragen en de stand van het proces
                komen uit het werkbare concept van het register ({formatDate(meta.backgroundDate)}).
              </li>
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
            <p className="mt-4 border-t border-border pt-4">
              Zie je een fout of heb je een suggestie? Geef feedback. Je bericht komt als openbare melding op GitHub.
            </p>
            <div className="mt-3">
              <FeedbackDialog variant="inline" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-white p-5 shadow-dmi-sm">
            <h2 className="dmi-tag text-[10px] text-muted-foreground">In cijfers</h2>
            <dl className="mt-3 grid grid-cols-2 gap-4">
              {[
                [totals.counts.goed, "geschikt"],
                [totals.counts.gewenst, "gewenst"],
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
                  <li key={s.title} className="flex gap-2">
                    <Icon className={s.format === "pdf" ? "size-4 shrink-0 text-[#a23b38]" : "size-4 shrink-0 text-[#2f7d4f]"} />
                    <span>
                      {s.title}
                      {s.version && ` v${s.version}`}
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
