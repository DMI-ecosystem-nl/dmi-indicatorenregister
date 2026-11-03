import type { Metadata } from "next";
import { Check, Circle, CircleDot } from "lucide-react";
import { GeschiktheidBadge } from "@/components/geschiktheid-badge";
import { Container, PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { geschiktheidOrder, indicatorTypes } from "@/data/taxonomy";
import { formatDate } from "@/lib/format";
import { indicators, meta, totals } from "@/lib/selectors";

export const metadata: Metadata = { title: "Proces & methodiek" };

const STEPS = [
  { title: "Blauwdruk G40", text: "Beleidsacties uit de Blauwdruk G40 voor slimme duurzame verstedelijking en mobiliteitsvernieuwing." },
  { title: "Vertaling (fase I)", text: "Per actie: welke doelen (I), hoe adresseren we die (II) en welke data zijn nodig (III)?" },
  { title: "Monitoringsvragen", text: `De behoefte is samengevat in ${totals.questions} monitoringsvragen, verdeeld over de DMI-domeinen.` },
  { title: "Beoordeling", text: `${totals.indicators} bestaande indicatoren beoordeeld op geschiktheid, met expertsessies per domein.` },
  { title: "Register", text: `${totals.register} indicatoren Goed of Gewenst in v${meta.pdfVersion}; getoetst door de community richting v1.0.` },
];

const CRITERIA = [
  "Compleetheid",
  "Relevantie binnen de scope van DMI",
  "Overlap met de Blauwdruk G40",
  "Beschikbaarheid van data",
  "Landsdekkend én regionale cijfers",
  "Meest recente data",
  "Beheerder van de data",
  "Aanwezigheid van historie",
];

function StatusCell({ value }: { value: string | null }) {
  if (!value) return <td className="px-2 py-2 text-center text-muted-foreground/50">–</td>;
  const done = value === "Afgerond" || value === "Compleet";
  const Icon = done ? Check : value === "Opgestart" || value === "Concept" ? CircleDot : Circle;
  return (
    <td className="px-2 py-2">
      <span
        className={
          done
            ? "inline-flex items-center gap-1 rounded-full bg-[#e4f2e0] px-2 py-0.5 text-[11px] text-[#2b5a3a]"
            : "inline-flex items-center gap-1 rounded-full bg-[#fdeecd] px-2 py-0.5 text-[11px] text-[#7a5410]"
        }
      >
        <Icon className="size-3" /> {value}
      </span>
    </td>
  );
}

export default function MethodiekPage() {
  const typeCounts = indicatorTypes.map((t) => ({
    ...t,
    all: indicators.filter((i) => i.type === t.value).length,
    reg: indicators.filter((i) => i.type === t.value && i.inRegister).length,
  }));
  const maxType = Math.max(...typeCounts.map((t) => t.all));
  const timeline = [
    ...meta.timeline.map((t) => ({ ...t, future: false })),
    { date: meta.pdfDate, title: `Concept v${meta.pdfVersion} (register-printout)`, future: false },
    { date: "2026-12-02", title: "Oplevering versie 1.0 indicatorenregister en dashboard", future: true },
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Proces & methodiek" }]}
        eyebrow="Verantwoording"
        title="Hoe het register tot stand komt"
        description={meta.intro.split("\n\n")[1]}
      />
      <Container className="space-y-16 py-10">
        <section>
          <h2 className="mb-5 font-heading text-xl font-semibold text-dmi-navy">Van beleid naar indicator</h2>
          <ol className="grid gap-3 md:grid-cols-5">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.08} className="relative h-full rounded-xl border border-border bg-white p-4 shadow-dmi-sm">
                  <span className="flex size-8 items-center justify-center rounded-full bg-dmi-navy font-heading text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 font-heading font-semibold text-dmi-navy">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 font-heading text-xl font-semibold text-dmi-navy">Beoordelingscriteria</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {CRITERIA.map((c) => (
                <li key={c} className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm">
                  <Check className="size-4 shrink-0 text-[#2f7d4f]" /> {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 font-heading text-xl font-semibold text-dmi-navy">Geschiktheid</h2>
            <dl className="space-y-3">
              {geschiktheidOrder.map((g) => (
                <div key={g} className="flex gap-3 rounded-lg border border-border bg-white p-3">
                  <dt className="w-24 shrink-0">
                    <GeschiktheidBadge value={g} size="md" />
                    <span className="mt-1 block text-xs text-muted-foreground tabular-nums">{totals.allCounts[g]} indicatoren</span>
                  </dt>
                  <dd className="text-sm">{meta.geschiktheidDefinitions[g]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section>
          <h2 className="mb-1 font-heading text-xl font-semibold text-dmi-navy">Indicatortypen: van context tot impact</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Elke indicator is ingedeeld in een keten. Balk: aantal beoordeelde indicatoren per type; donker deel: opgenomen in het register.
          </p>
          <div className="overflow-x-auto">
            <ol className="flex min-w-[760px] items-stretch gap-1.5">
              {typeCounts.map((t, i) => (
                <Reveal as="li" key={t.value} delay={i * 0.05} className="flex flex-1 flex-col rounded-lg border border-border bg-white p-3">
                    <span className="dmi-tag text-[10px] text-dmi-blue">{t.value}</span>
                    <span className="font-heading text-sm font-semibold text-dmi-navy">{t.label}</span>
                    <span className="mt-1 text-[11px] leading-snug text-muted-foreground">{t.description}</span>
                    <div className="mt-auto pt-3">
                      <div className="relative h-16 rounded bg-dmi-blue-050">
                        <div className="absolute inset-x-2 bottom-0 rounded-t-[4px] bg-dmi-blue-200" style={{ height: `${(t.all / maxType) * 100}%` }} />
                        <div className="absolute inset-x-2 bottom-0 rounded-t-[4px] bg-dmi-navy" style={{ height: `${(t.reg / maxType) * 100}%` }} />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                        <strong className="text-dmi-navy">{t.reg}</strong> / {t.all}
                      </p>
                    </div>
                </Reveal>
              ))}
            </ol>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {indicators.filter((i) => i.type === null).length} indicatoren hebben (nog) geen type.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-dmi-navy">Voortgang per domein</h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-dmi-sm">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-dmi-blue-050 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Domein</th>
                  {meta.phases.map((p) => (
                    <th key={p.code} className="px-2 py-2 font-medium">
                      <span className="block text-dmi-navy">{p.code}</span>
                      <span className="block font-normal">{p.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {meta.phaseStatus.map((r) => (
                  <tr key={r.domain}>
                    <td className="px-3 py-2 font-medium text-dmi-navy">{r.domain}</td>
                    {r.statuses.map((s, i) => (
                      <StatusCell key={i} value={i === 0 ? "Afgerond" : s} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Stand volgens het register v{meta.excelVersion} ({formatDate(meta.excelDate)}).</p>
        </section>

        <section>
          <h2 className="mb-6 font-heading text-xl font-semibold text-dmi-navy">Tijdlijn 2026</h2>
          <ol className="relative ml-3 border-l-2 border-dmi-blue-200">
            {timeline.map((t, i) => (
              <Reveal as="li" key={`${t.date}-${i}`} delay={Math.min(i, 6) * 0.04} className="relative mb-5 pl-6">
                  <span
                    className={
                      t.future
                        ? "absolute -left-[9px] top-1 size-4 rounded-full border-2 border-dmi-gold bg-white"
                        : "absolute -left-[9px] top-1 size-4 rounded-full border-2 border-white bg-dmi-navy"
                    }
                  />
                  <p className="dmi-tag text-[11px] text-dmi-blue">{formatDate(t.date)}</p>
                  <p className={t.future ? "font-medium text-dmi-navy" : "text-sm text-foreground/90"}>{t.title}</p>
              </Reveal>
            ))}
          </ol>
        </section>
      </Container>
    </>
  );
}
