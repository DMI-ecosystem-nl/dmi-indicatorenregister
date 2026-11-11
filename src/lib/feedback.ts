/** Shared between the feedback dialog (client) and `/api/feedback` (server). */

export const FEEDBACK_CATEGORIES = [
  { value: "inhoud", label: "Fout in de inhoud", githubLabel: "inhoud" },
  { value: "suggestie", label: "Suggestie", githubLabel: "enhancement" },
  { value: "vraag", label: "Vraag", githubLabel: "question" },
  { value: "technisch", label: "Technisch probleem", githubLabel: "bug" },
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["value"];

export const FEEDBACK_MESSAGE_MIN = 10;
export const FEEDBACK_MESSAGE_MAX = 4000;

export const FEEDBACK_FALLBACK_EMAIL = "dmiteam@minienw.nl";

export type FeedbackRequest = {
  category: FeedbackCategory;
  message: string;
  /** Path + query of the page the visitor was on. */
  page: string;
  /** Honeypot: real visitors leave this empty. */
  website?: string;
};

export type FeedbackResponse = { ok: true; number?: number; url?: string } | { ok: false; error: string };

export function feedbackCategory(value: unknown) {
  return FEEDBACK_CATEGORIES.find((c) => c.value === value);
}
