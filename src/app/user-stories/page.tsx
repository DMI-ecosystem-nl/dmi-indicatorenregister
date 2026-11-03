import type { Metadata } from "next";
import Image from "next/image";
import { CptExplorer } from "@/components/cpt-explorer";
import { Container, PageHeader } from "@/components/page-header";
import { beleidsbouwblokken, cptConclusion, userStories } from "@/data/content/cpt";

export const metadata: Metadata = { title: "User stories & CPT" };

export default function UserStoriesPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "User stories & CPT" }]}
        eyebrow="DMI-dashboard · MVP"
        title="User stories, beleidsbouwblokken en capabilities"
        description="De MVP-user stories van het DMI-dashboard zijn gekoppeld aan beleidsbouwblokken en aan de onderliggende capabilities uit de Digital Twin Capabilities Periodic Table (CPT) van het Digital Twin Consortium. Zo wordt expliciet welke functionaliteit het dashboard nodig heeft."
      />
      <Container className="space-y-12 py-8">
        <section>
          <h2 className="mb-1 font-heading text-xl font-semibold text-dmi-navy">Overzicht</h2>
          <p className="mb-4 text-sm text-muted-foreground">Zeven user stories voor de eerste MVP-fase.</p>
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
            Kies een user story om de benodigde capabilities in de CPT te markeren.
          </p>
          <CptExplorer />
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="mb-3 font-heading text-xl font-semibold text-dmi-navy">Beleidsbouwblokken</h2>
            <ul className="flex flex-wrap gap-2">
              {beleidsbouwblokken.map((b) => (
                <li
                  key={b.name}
                  className={
                    b.mvp
                      ? "rounded-lg bg-dmi-navy px-3 py-1.5 text-sm font-medium text-white"
                      : "rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground"
                  }
                >
                  {b.name}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Donker: gebruikt in de MVP. Gestippeld: latere ontwikkelfasen.
            </p>
            <blockquote className="mt-6 border-l-4 border-dmi-gold pl-4 text-sm leading-relaxed text-dmi-navy">
              {cptConclusion}
            </blockquote>
          </div>
          <figure className="rounded-xl border border-border bg-white p-3 shadow-dmi-sm">
            <Image
              src="/cpt/beleidsbouwblokken-cpt.png"
              alt="Visualisatie van de beleidsbouwblokken op de Digital Twin Capabilities Periodic Table"
              width={1180}
              height={546}
              className="h-auto w-full"
            />
            <figcaption className="mt-2 text-center text-xs text-muted-foreground">
              Visualisatie beleidsbouwblokken op de CPT
            </figcaption>
          </figure>
        </section>
      </Container>
    </>
  );
}
