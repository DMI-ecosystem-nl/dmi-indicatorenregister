import Link from "next/link";
import { Container } from "@/components/page-header";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="dmi-tag text-xs text-dmi-blue">404</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold text-dmi-navy">Pagina niet gevonden</h1>
      <p className="mt-2 text-muted-foreground">Deze indicator, vraag of pagina bestaat niet (meer).</p>
      <Link href="/" className="mt-6 inline-block text-dmi-blue hover:underline">Terug naar het register</Link>
    </Container>
  );
}
