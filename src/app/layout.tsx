import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ConceptBanner } from "@/components/concept-banner";
import { MotionProvider } from "@/components/motion-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const plex = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plexCondensed = IBM_Plex_Sans_Condensed({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "DMI Indicatorenregister",
    template: "%s · DMI Indicatorenregister",
  },
  description:
    "Het DMI indicatorenregister voor slimme duurzame verstedelijking en mobiliteitsvernieuwing: van Blauwdruk G40-acties via monitoringsvragen naar bestaande, landsdekkende indicatoren.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${plex.variable} ${plexCondensed.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <MotionProvider>
        <TooltipProvider delay={150}>
          <ConceptBanner />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </TooltipProvider>
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
