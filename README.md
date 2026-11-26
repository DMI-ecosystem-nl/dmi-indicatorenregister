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

1. Zet de nieuwe uitdraai in `source-docs/` (Excel `*Uitdraai <versie>*.xlsx`; de hoogste versie
   in de bestandsnaam wint).
2. `npm run extract` (vereist Python 3 met `openpyxl`).
3. Controleer de rapportage (aantallen en waarschuwingen).

De uitdraai is de enige bron voor de indicatoren: geschiktheid, hoofddomein en relevante domeinen,
beschrijving, brondata, Blauwdruk G40-koppeling en metadata. Het werkbare concept
(`*Indicatorenregister*werkbaar concept*.xlsx`) levert alleen achtergrond: de Blauwdruk G40-vertaling,
de formulering van de monitoringsvragen, de definities en de proces-/tijdlijngegevens.

## Ontwikkelen

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

Alle pagina's zijn statisch; alleen `/api/feedback` draait op de server.

## Feedbackknop

De knop *Feedback geven* (zijbalk, mobiele kop, pagina Over) maakt via `POST /api/feedback`
een issue aan in [DMI-ecosystem-nl/dmi-indicatorenregister](https://github.com/DMI-ecosystem-nl/dmi-indicatorenregister/issues),
met de labels `feedback` plus `inhoud`, `enhancement`, `question` of `bug`.

| Variabele | Waarde |
| --- | --- |
| `GITHUB_APP_ID` | App ID van de GitHub App van `DMI-ecosystem-nl` (permissie *Issues: Read and write*, geïnstalleerd op deze repository). |
| `GITHUB_APP_INSTALLATION_ID` | Installation ID van die App in de organisatie. |
| `GITHUB_APP_PRIVATE_KEY` | Private key (`.pem`) van de App, base64-gecodeerd op één regel (`base64 -i key.pem`). |
| `GITHUB_FEEDBACK_TOKEN` | Alternatief voor de App: fine-grained personal access token met dezelfde permissie. |
| `GITHUB_FEEDBACK_REPO` | Optioneel, `owner/naam`. Standaard `DMI-ecosystem-nl/dmi-indicatorenregister`. |

Een GitHub App verloopt niet; de site haalt zelf elk uur een nieuw installatietoken op. Zet de variabelen als
secrets bij de hosting en lokaal in `.env.local`. Zonder gegevens toont de knop een
melding met het e-mailadres van het DMI-team. Bescherming tegen misbruik: same-origin-check, honeypot,
lengtegrenzen, max. 5 berichten per IP per 10 minuten (per serverinstantie), en `@mentions` worden onschadelijk gemaakt.
De repository is openbaar: het formulier vraagt bezoekers geen persoonsgegevens in hun bericht te zetten.

Contact is optioneel. Wie *Neem contact met me op* aanvinkt, krijgt eerst de vraag of die zeker is (de gegevens
worden openbaar; anoniem blijven kan ook). Pas na bevestiging verschijnen naam, organisatie (beide optioneel) en
e-mailadres. Die komen in de openbare issue, met het label `contact gewenst`. Teksten staan in `src/data/content/feedback.ts`.
