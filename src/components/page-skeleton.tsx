import { Container } from "./page-header";

/** Static fallback while a param-dependent page streams in. */
export function PageSkeleton() {
  return (
    <>
      <section className="border-b border-border bg-dmi-blue-050 dmi-grid-bg">
        <Container className="space-y-4 pb-8 pt-6">
          <div className="h-3 w-40 animate-pulse rounded bg-dmi-blue-100" />
          <div className="h-9 w-2/3 animate-pulse rounded bg-dmi-blue-100" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-dmi-blue-100" />
        </Container>
      </section>
      <Container className="grid gap-3 py-8 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-dmi-blue-050" />
        ))}
      </Container>
    </>
  );
}
