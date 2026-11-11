import { FEEDBACK_FALLBACK_EMAIL as MAIL, type FeedbackCategory } from "@/lib/feedback";

/** Copy for the feedback dialog and `/api/feedback`. */

type Copy = {
  trigger: string;
  title: string;
  intro: string;
  categoryLegend: string;
  categories: Record<FeedbackCategory, string>;
  messageLabel: string;
  messagePlaceholder: string;
  messageHint: string;
  contactCheckbox: string;
  confirmTitle: string;
  confirmBody: string;
  confirmYes: string;
  confirmNo: string;
  contactNotice: string;
  name: string;
  email: string;
  organisation: string;
  optional: string;
  cancel: string;
  submit: string;
  sending: string;
  sentTitle: string;
  sentWithNumber: (n: number) => string;
  sent: string;
  sentContact: string;
  viewOnGitHub: string;
  close: string;
  errors: {
    forbidden: string;
    unavailable: string;
    invalid: string;
    category: string;
    length: (min: number, max: number) => string;
    email: string;
    rateLimit: string;
    rejected: string;
    unreachable: string;
    failed: string;
    network: string;
  };
};

export const feedbackCopy: Copy = {
  trigger: "Feedback geven",
  title: "Feedback geven",
  intro:
    "Meld een fout, stel een vraag of doe een suggestie. Je bericht komt als openbare melding op GitHub. Zet geen persoonsgegevens in je bericht.",
  categoryLegend: "Soort",
  categories: {
    inhoud: "Fout in de inhoud",
    suggestie: "Suggestie",
    vraag: "Vraag",
    technisch: "Technisch probleem",
  },
  messageLabel: "Bericht",
  messagePlaceholder: "Bijvoorbeeld: de bron bij deze indicator is verouderd.",
  messageHint: "We sturen het adres van deze pagina mee.",
  contactCheckbox: "Neem contact met me op over deze feedback",
  confirmTitle: "Weet je het zeker?",
  confirmBody:
    "Je naam, e-mailadres en organisatie komen openbaar in de melding op GitHub. Iedereen kan ze lezen. Je kunt ook anoniem feedback geven, maar dan kunnen we geen contact met je opnemen.",
  confirmYes: "Ja, maak mijn gegevens openbaar",
  confirmNo: "Nee, blijf anoniem",
  contactNotice: "Deze gegevens komen openbaar op GitHub.",
  name: "Naam",
  email: "E-mailadres",
  organisation: "Organisatie",
  optional: "optioneel",
  cancel: "Annuleren",
  submit: "Versturen",
  sending: "Bezig met versturen",
  sentTitle: "Bedankt voor je feedback",
  sentWithNumber: (n) => `Je feedback staat op GitHub als melding #${n}. Het DMI-team bekijkt elke melding.`,
  sent: "We hebben je feedback ontvangen. Het DMI-team bekijkt elke melding.",
  sentContact: "Het DMI-team kan je over deze melding mailen.",
  viewOnGitHub: "Bekijk op GitHub",
  close: "Sluiten",
  errors: {
    forbidden: "Verzoek geweigerd.",
    unavailable: `Feedback versturen is nu niet mogelijk. Mail het DMI-team via ${MAIL}.`,
    invalid: "Het verzoek is ongeldig.",
    category: "Kies een soort feedback.",
    length: (min, max) => `Schrijf een bericht van ${min} tot ${max} tekens.`,
    email: "Vul een geldig e-mailadres in.",
    rateLimit: "Je hebt veel berichten kort na elkaar verstuurd. Probeer het over 10 minuten opnieuw.",
    rejected: `GitHub heeft de melding niet aangenomen. Probeer het later opnieuw of mail het DMI-team via ${MAIL}.`,
    unreachable: `We konden GitHub niet bereiken. Probeer het later opnieuw of mail het DMI-team via ${MAIL}.`,
    failed: `Versturen is mislukt. Mail het DMI-team via ${MAIL}.`,
    network: "Versturen is mislukt. Controleer je internetverbinding en probeer het opnieuw.",
  },
};
