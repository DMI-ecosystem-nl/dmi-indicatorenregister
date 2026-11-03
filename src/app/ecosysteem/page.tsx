import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { EcosystemDiagram } from "@/components/ecosystem-diagram";
import { Container, PageHeader } from "@/components/page-header";
import { roadmap } from "@/data/content/ecosystem";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Ecosysteem & PDX" };

export default function EcosysteemPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Ecosysteem & PDX" }]}
        eyebrow="Context"
        title="Het register in het DMI-ecosysteem"
        description="Het indicatorenregister verbindt de informatiebehoefte van gemeenten met het aanbod van datasets en indicatoren. Via de PDX komen vraag en aanbod samen; het DMI-dashboard en het City Support Centre maken de indicatoren bruikbaar voor gemeenten."
      />
      <Container className="space-y-12 py-8">
        <EcosystemDiagram />
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold text-dmi-navy">Vooruitblik</h2>
          <ol className="grid gap-3 md:grid-cols-2">
            {roadmap.map((r) => (
              <li key={r.date} className="flex gap-3 rounded-xl border border-border bg-white p-4 shadow-dmi-sm">
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-dmi-blue" />
                <div>
                  <p className="dmi-tag text-[11px] text-dmi-blue">{/^\d{4}-/.test(r.date) ? formatDate(r.date) : r.date}</p>
                  <p className="text-sm text-dmi-navy">{r.title}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Container>
    </>
  );
}
