# DMI Indicatorenregister

Doorzoekbare website voor het DMI indicatorenregister *Slimme duurzame verstedelijking en
mobiliteitsvernieuwing*: van Blauwdruk G40-acties via monitoringsvragen naar bestaande indicatoren.

Stack: Next.js 16 (App Router, Cache Components, volledig statisch), Tailwind v4, shadcn (base-ui),
lucide-react, Motion. Huisstijl: DMI design-system tokens (IBM Plex, navy/goud).

## Pagina's

| Route | Inhoud |
| --- | --- |
| `/` | Introductie, kerncijfers, drie ingangen, geschiktheid per domein, gewenste indicatoren |
| `/domeinen`, `/domeinen/[slug]` | Ingang 1: DMI-domeinen → monitoringsvragen → indicatoren |
| `/blauwdruk`, `/blauwdruk/[slug]` | Ingang 2: actielijnen A–F → acties (vraag I/II/III) → vragen → indicatoren |
| `/blauwdruk/matrix` | Dekkingsmatrix acties × monitoringsvragen |
| `/vragen`, `/vragen/[slug]` | Ingang 3: monitoringsvragen met alle beoordeelde kandidaten |
| `/indicatoren`, `/indicatoren/[slug]` | Catalogus met facetten (URL-gestuurd), kaarten/tabel, detailpagina met metadata |
| `/ecosysteem` | Interactief DMI-ecosysteem (vraag, aanbod, register, PDX, dashboard, CSC) |
| `/methodiek` | Werkwijze, criteria, geschiktheid, indicatortypen, voortgang, tijdlijn |
| `/user-stories` | MVP-user stories ↔ beleidsbouwblokken ↔ Digital Twin CPT |
| `/over` | Colofon, status en bronverwerking |

## Data bijwerken

1. Zet de nieuwe bronbestanden in `source-docs/` (Excel `*Indicatorenregister*.xlsx`, PDF `*indicatorenregister*.pdf`).
2. `npm run extract` (vereist Python 3 met `openpyxl` en `pdftotext` van poppler).
3. Controleer de rapportage (aantallen, gewijzigde geschiktheid/domeinen, waarschuwingen).

De Excel levert de metadata; de PDF-printout (nieuwere versie) bepaalt opname in het register,
de indelingscode (A01…), de geschiktheid en het (nieuwe) domein.

## Ontwikkelen

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

Hosting: Vercel. Alle pagina's zijn statisch; alleen `/api/feedback` draait op de server.

## Feedbackknop

De knop *Feedback geven* (zijbalk, mobiele kop, pagina Over) maakt via `POST /api/feedback`
een issue aan in [DMI-ecosystem-nl/dmi-indicatorenregister](https://github.com/DMI-ecosystem-nl/dmi-indicatorenregister/issues),
met de labels `feedback` plus `inhoud`, `enhancement`, `question` of `bug`.

| Variabele | Waarde |
| --- | --- |
| `GITHUB_FEEDBACK_TOKEN` | Fine-grained personal access token; resource owner `DMI-ecosystem-nl`, alleen deze repository, permissie *Issues: Read and write*. |
| `GITHUB_FEEDBACK_REPO` | Optioneel, `owner/naam`. Standaard `DMI-ecosystem-nl/dmi-indicatorenregister`. |

Zet ze in Vercel (Production en Preview) en lokaal in `.env.local`. Zonder token toont de knop een
melding met het e-mailadres van het DMI-team. Bescherming tegen misbruik: same-origin-check, honeypot,
lengtegrenzen, max. 5 berichten per IP per 10 minuten (per serverinstantie), en `@mentions` worden onschadelijk gemaakt.
De repository is openbaar: het formulier vraagt bezoekers geen persoonsgegevens in hun bericht te zetten.

Contact is optioneel. Wie *Neem contact met me op* aanvinkt, krijgt eerst de vraag of die zeker is (de gegevens
worden openbaar; anoniem blijven kan ook). Pas na bevestiging verschijnen naam, organisatie (beide optioneel) en
e-mailadres. Die komen in de openbare issue, met het label `contact gewenst`. Teksten staan in `src/data/content/feedback.ts`.
