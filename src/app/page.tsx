import Link from "next/link";
import { ArrowRight, BarChart3, HelpCircle, Landmark, LayoutGrid, Network, Workflow } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { CoverageBar, CoverageLegend } from "@/components/coverage-bar";
import { DomainIcon } from "@/components/domain-icon";
import { HeroItem, HeroMotion } from "@/components/hero";
import { IndicatorRow } from "@/components/indicator-row";
import { Container } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { domains } from "@/data/taxonomy";
import { domainStats, indicators, meta, totals } from "@/lib/selectors";

const ENTRIES = [
  {
    href: "/domeinen",
    icon: LayoutGrid,
    eyebrow: "Ingang 1",
    title: "DMI-domeinen",
    text: "Van bouwen tot circulariteit: per domein de monitoringsvragen en indicatoren.",
    stat: `${totals.domains} domeinen`,
  },
  {
    href: "/blauwdruk",
    icon: Landmark,
    eyebrow: "Ingang 2",
    title: "Blauwdruk G40",
    text: "Start bij het beleid: van actie via monitoringsvraag naar indicator.",
    stat: `${totals.actions} acties`,
  },
  {
    href: "/vragen",
    icon: HelpCircle,
    eyebrow: "Ingang 3",
    title: "Monitoringsvragen",
    text: "Start bij de vraag ‘wat willen we weten?’ en zie welke indicatoren antwoord geven.",
    stat: `${totals.questions} vragen`,
  },
];

export default function Home() {
  const stats = domainStats();
  const gewenst = indicators.filter((i) => i.inRegister && i.geschiktheid === "gewenst");

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-dmi-blue-050 dmi-grid-bg">
        <div className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-dmi-gold/15 blur-3xl" />
        <Container className="relative py-14 sm:py-20">
          <HeroMotion>
            <HeroItem>
              <p className="dmi-tag text-xs text-dmi-blue">DMI Ecosysteem · Indicatorenregister</p>
            </HeroItem>
            <HeroItem>
              <h1 className="mt-3 max-w-4xl font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-dmi-navy sm:text-6xl">
                Slimme duurzame verstedelijking en mobiliteitsvernieuwing, meetbaar gemaakt
              </h1>
            </HeroItem>
            <HeroItem>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                Het register vertaalt de beleidsacties uit de Blauwdruk G40 naar monitoringsvragen en koppelt die
                aan bestaande, landsdekkende indicatoren, inclusief bron, schaalniveau, actualiteit en geschiktheid.
              </p>
            </HeroItem>
            <HeroItem className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/indicatoren"
                className="inline-flex items-center gap-2 rounded-lg bg-dmi-navy px-4 py-2.5 text-sm font-medium text-white shadow-dmi-md hover:bg-dmi-blue"
              >
                <BarChart3 className="size-4" /> Bekijk alle indicatoren
              </Link>
              <Link
                href="/ecosysteem"
                className="inline-flex items-center gap-2 rounded-lg border border-dmi-navy/20 bg-white px-4 py-2.5 text-sm font-medium text-dmi-navy hover:border-dmi-navy/40"
              >
                <Network className="size-4" /> Rol in het DMI-ecosysteem
              </Link>
            </HeroItem>
            <HeroItem>
              <dl className="mt-12 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
                {[
                  [totals.register, "indicatoren in het register"],
                  [totals.indicators, "indicatoren beoordeeld"],
                  [totals.questions, "monitoringsvragen"],
                  [totals.actions, "Blauwdruk G40-acties"],
                ].map(([n, l]) => (
                  <div key={l as string} className="border-l-2 border-dmi-gold pl-4">
                    <dt className="font-heading text-4xl font-semibold text-dmi-navy tabular-nums">
                      <CountUp value={n as number} />
                    </dt>
                    <dd className="mt-1 text-sm text-muted-foreground">{l}</dd>
                  </div>
                ))}
              </dl>
            </HeroItem>
          </HeroMotion>
        </Container>
      </section>

      <Container className="space-y-16 py-12">
        <section>
          <h2 className="font-heading text-2xl font-semibold text-dmi-navy">Drie manieren om te zoeken</h2>
          <p className="mt-1 text-sm text-muted-foreground">Kies de ingang die past bij je vraag, of gebruik ⌘K om direct te zoeken.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {ENTRIES.map((e, i) => (
              <Reveal key={e.href} delay={i * 0.08}>
                <Link
                  href={e.href}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-dmi-sm transition-all hover:-translate-y-1 hover:border-dmi-blue-200 hover:shadow-dmi-lg"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-dmi-navy text-white transition-colors group-hover:bg-dmi-gold group-hover:text-dmi-navy">
                    <e.icon className="size-5" />
                  </span>
                  <p className="dmi-tag mt-5 text-[10px] text-muted-foreground">{e.eyebrow}</p>
                  <h3 className="font-heading text-xl font-semibold text-dmi-navy">{e.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{e.text}</p>
                  <p className="mt-auto flex items-center justify-between pt-5 text-sm font-medium text-dmi-blue">
                    {e.stat}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-dmi-navy">Geschiktheid per domein</h2>
                <p className="mt-1 text-sm text-muted-foreground">Alle beoordeelde indicatoren, naar uitkomst van de beoordeling.</p>
              </div>
              <CoverageLegend />
            </div>
            <ul className="mt-5 space-y-3">
              {stats.map((s) => (
                <li key={s.code}>
                  <Link href={`/domeinen/${domains[s.code].slug}`} className="group grid grid-cols-[1.25rem_8.5rem_minmax(0,1fr)_2.5rem] items-center gap-3">
                    <DomainIcon code={s.code} className="size-4 text-dmi-blue" />
                    <span className="truncate text-sm text-dmi-navy group-hover:underline">{domains[s.code].short}</span>
                    <CoverageBar counts={s.counts} height={10} />
                    <span className="text-right text-xs text-muted-foreground tabular-nums">{s.total}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0 rounded-2xl border border-dmi-gold/50 bg-[#fdf8ec] p-6">
            <p className="dmi-tag text-[10px] text-[#7a5410]">Signaal richting data-aanbieders</p>
            <h2 className="mt-1 font-heading text-xl font-semibold text-dmi-navy">{gewenst.length} gewenste indicatoren</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Duidelijke vraag vanuit de Blauwdruk G40, maar nog niet compleet of niet landsdekkend beschikbaar.
            </p>
            <div className="mt-4 max-h-80 overflow-y-auto rounded-xl bg-white p-1">
              {gewenst.map((i) => (
                <IndicatorRow key={i.slug} indicator={i} />
              ))}
            </div>
            <Link href="/indicatoren?g=gewenst" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-dmi-blue hover:underline">
              Bekijk in de catalogus <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { href: "/blauwdruk/matrix", icon: LayoutGrid, title: "Dekkingsmatrix", text: "Welke G40-acties zijn al goed te monitoren, en waar zitten de gaten?" },
            { href: "/methodiek", icon: Workflow, title: "Proces & methodiek", text: "Hoe 300+ indicatoren zijn beoordeeld, en de tijdlijn richting v1.0." },
            { href: "/user-stories", icon: Network, title: "User stories & CPT", text: "Wat het DMI-dashboard moet kunnen, gekoppeld aan digital twin-capabilities." },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="group flex gap-4 rounded-xl border border-border bg-white p-5 hover:border-dmi-blue-200 hover:shadow-dmi-md">
              <c.icon className="mt-0.5 size-5 shrink-0 text-dmi-blue" />
              <span>
                <span className="block font-heading font-semibold text-dmi-navy group-hover:underline">{c.title}</span>
                <span className="block text-sm text-muted-foreground">{c.text}</span>
              </span>
            </Link>
          ))}
        </section>

        <p className="text-xs text-muted-foreground">
          Gebaseerd op concept v{meta.pdfVersion}. Inhoud kan wijzigen na toetsing door de DMI Indicatoren community.
        </p>
      </Container>
    </>
  );
}
