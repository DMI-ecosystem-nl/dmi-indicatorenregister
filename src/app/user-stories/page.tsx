import type { Metadata } from "next";
import Image from "next/image";
import { CptExplorer } from "@/components/cpt-explorer";
import { Container, PageHeader } from "@/components/page-header";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
  beleidsbouwblokken,
  cptConclusion,
  cptFacts,
  cptGrid,
  cptGroupInfo,
  cptGroups,
  userStories,
} from "@/data/content/cpt";

export const metadata: Metadata = { title: "User stories & CPT" };

export default function UserStoriesPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "User stories & CPT" }]}
        eyebrow="DMI-dashboard · MVP"
        title="User stories, beleidsbouwblokken en capabilities"
        description="Wat moet het DMI-dashboard kunnen? Deze pagina beschrijft dat in drie lagen. De user story zegt wat de gebruiker wil. Het beleidsbouwblok zegt welk soort functie dat vraagt. De capability uit de Digital Twin Capabilities Periodic Table (CPT) zegt welke technische functie nodig is."
      />
      <Container className="space-y-12 py-8">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3 text-sm leading-relaxed">
            <h2 className="font-heading text-xl font-semibold text-dmi-navy">Wat is de CPT?</h2>
            <p>
              De Digital Twin Capabilities Periodic Table (CPT) is een overzicht van functies (capabilities) die een
              digital twin kan hebben. Het Digital Twin Consortium heeft de CPT ontwikkeld. De opbouw lijkt op het
              periodiek systeem van de scheikunde: elke functie heeft een eigen vak en een afkorting, zoals UX.DB
              voor Dashboards.
            </p>
            <p>
              De CPT beschrijft <em>wat</em> een digital twin moet kunnen, niet <em>hoe</em>. De tabel is niet
              gebonden aan een architectuur, product of technologie. Daarom kun je met de CPT eisen opstellen voor
              een use case. Je kunt er ook oplossingen van verschillende leveranciers mee vergelijken.
            </p>
            <p>
              De {cptGrid.flat().filter(Boolean).length} functies zijn verdeeld over zes groepen. Hieronder staat per
              groep wat de functies doen.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-4 self-start rounded-xl border border-border bg-white p-5 shadow-dmi-sm">
            {[
              ["Uitgever", cptFacts.publisher],
              ["Gepubliceerd", cptFacts.released],
              ["Gebruikte versie", cptFacts.version],
              ["Omvang", `${cptGrid.flat().filter(Boolean).length} functies in 6 groepen`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="dmi-tag text-[10px] text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-sm font-medium text-dmi-navy">{v}</dd>
              </div>
            ))}
            <a
              href={cptFacts.url}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 inline-flex items-center gap-1.5 text-sm text-dmi-blue hover:underline"
            >
              <ExternalLink className="size-3.5" /> Digital Twin Consortium
            </a>
          </dl>
        </section>

        <section>
          <h2 className="mb-1 font-heading text-xl font-semibold text-dmi-navy">De zes groepen en de beleidsbouwblokken</h2>
          <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
            Beleidsbouwblokken vertalen de CPT naar taal die bij beleid past. Elk bouwblok staat voor een aantal
            CPT-functies. Zo praten beleidsmakers en ontwikkelaars over dezelfde functies. De donkere bouwblokken zijn
            nodig voor de eerste versie (MVP) van het dashboard.
          </p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cptGroupInfo.map((g) => {
              const n = cptGrid.flat().filter((c) => c && c[0].startsWith(g.group)).length;
              return (
                <div
                  key={g.group}
                  className="flex flex-col gap-3 rounded-xl border p-4"
                  style={{ backgroundColor: cptGroups[g.group].bg, borderColor: cptGroups[g.group].border }}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-heading font-semibold text-dmi-navy">
                      <span className="dmi-tag mr-1.5 text-[11px]">{g.group}</span>
                      {g.title}
                    </h3>
                    <span className="text-xs text-muted-foreground tabular-nums">{n} functies</span>
                  </div>
                  <p className="text-sm text-foreground/85">{g.text}</p>
                  {g.blocks.length > 0 ? (
                    <ul className="mt-auto flex flex-wrap gap-1.5">
                      {g.blocks.map((b) => {
                        const mvp = beleidsbouwblokken.find((x) => x.name === b)?.mvp;
                        return (
                          <li
                            key={b}
                            className={
                              mvp
                                ? "rounded-md bg-dmi-navy px-2 py-0.5 text-xs font-medium text-white"
                                : "rounded-md border border-dashed border-dmi-navy/30 bg-white/60 px-2 py-0.5 text-xs text-muted-foreground"
                            }
                          >
                            {b}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-auto text-xs text-muted-foreground">Geen eigen beleidsbouwblok in de figuur.</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-dmi-navy">Hoe lees je de koppeling?</h2>
          <ol className="grid gap-3 md:grid-cols-3">
            {[
              ["1 · User story", "Wat wil de gebruiker?", "US-2: trends over tijd bekijken."],
              ["2 · Beleidsbouwblok", "Welk soort functie vraagt dat?", "Tijdreizen, Visualiseren en Analyseren."],
              ["3 · CPT-functie", "Welke technische functie is nodig?", "DS.DS (historische data beheren), UX.BI (trends tonen) en IC.AA (ontwikkelingen analyseren)."],
            ].map(([step, q, ex], i) => (
              <li key={step} className="relative rounded-xl border border-border bg-white p-4 shadow-dmi-sm">
                <p className="dmi-tag text-[10px] text-dmi-blue">{step}</p>
                <p className="mt-1 font-heading font-semibold text-dmi-navy">{q}</p>
                <p className="mt-1 text-sm text-muted-foreground">Voorbeeld: {ex}</p>
                {i < 2 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 rounded-full bg-white text-dmi-gold md:block" />
                )}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-1 font-heading text-xl font-semibold text-dmi-navy">Overzicht</h2>
          <p className="mb-4 text-sm text-muted-foreground">Zeven user stories voor de eerste versie (MVP).</p>
          <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-dmi-sm">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-dmi-blue-050 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">User story</th>
                  <th className="px-4 py-2 font-medium">Beleidsbouwblokken</th>
                  <th className="px-4 py-2 font-medium">CPT-capabilities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {userStories.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2.5">
                      <span className="dmi-tag mr-2 text-[11px] text-dmi-blue">{s.id}</span>
                      <span className="font-medium text-dmi-navy">{s.title}</span>
                    </td>
                    <td className="px-4 py-2.5 text-foreground/90">{s.blocks.join(", ")}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-dmi-navy">
                      {[...new Set(s.rows.map((r) => r.capability))].join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-1 font-heading text-xl font-semibold text-dmi-navy">Capabilities per user story</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Kies een user story. De CPT toont dan de functies die deze story nodig heeft.
          </p>
          <CptExplorer />
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-dmi-navy">Wat levert het register hiervoor?</h2>
            <p className="text-sm leading-relaxed">
              Drie user stories gaan over uitleg en vertrouwen. Het indicatorenregister levert daarvoor de basis:
            </p>
            <ul className="space-y-2 text-sm">
              {[
                ["US-3", "Definities", "naam, monitoringsvraag, type en eenheid van elke indicator."],
                ["US-4", "Herkomst", "bron, dataverzamelaar, voorwaarden voor gebruik en actualiteit."],
                ["US-5", "Berekeningswijze", "toelichting op de beoordeling en, waar ingevuld, de meetmethode."],
              ].map(([id, t, d]) => (
                <li key={id} className="flex gap-3 rounded-lg border border-border bg-white p-3">
                  <span className="dmi-tag mt-0.5 whitespace-nowrap text-[11px] text-dmi-blue">{id}</span>
                  <span>
                    <strong className="text-dmi-navy">{t}:</strong> {d}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/indicatoren" className="inline-flex items-center gap-1 text-sm font-medium text-dmi-blue hover:underline">
              Bekijk de indicatoren <ArrowRight className="size-4" />
            </Link>
            <h2 className="pt-4 font-heading text-xl font-semibold text-dmi-navy">Conclusie uit het document</h2>
            <blockquote className="border-l-4 border-dmi-gold pl-4 text-sm leading-relaxed text-dmi-navy">
              {cptConclusion}
            </blockquote>
          </div>
          <figure className="self-start rounded-xl border border-border bg-white p-3 shadow-dmi-sm">
            <Image
              src="/cpt/beleidsbouwblokken-cpt.png"
              alt="Visualisatie van de beleidsbouwblokken op de Digital Twin Capabilities Periodic Table"
              width={1180}
              height={546}
              className="h-auto w-full"
            />
            <figcaption className="mt-2 text-center text-xs text-muted-foreground">
              De beleidsbouwblokken op de CPT (bron: CPT-koppeling user stories)
            </figcaption>
          </figure>
        </section>
      </Container>
    </>
  );
}
