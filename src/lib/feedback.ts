/** Shared between the feedback dialog (client) and `/api/feedback` (server). */

export const FEEDBACK_CATEGORIES = [
  { value: "inhoud", githubLabel: "inhoud" },
  { value: "suggestie", githubLabel: "enhancement" },
  { value: "vraag", githubLabel: "question" },
  { value: "technisch", githubLabel: "bug" },
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["value"];

export const FEEDBACK_MESSAGE_MIN = 10;
export const FEEDBACK_MESSAGE_MAX = 4000;

export const FEEDBACK_FALLBACK_EMAIL = "dmiteam@minienw.nl";

/** Max length of name, organisation and email. */
export const FEEDBACK_CONTACT_MAX = 120;

/** Deliberately strict: no spaces, backticks, brackets or quotes, so it is safe in markdown. */
const EMAIL_RE = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function isValidEmail(value: string) {
  return value.length <= FEEDBACK_CONTACT_MAX && EMAIL_RE.test(value);
}

/**
 * Optional contact details. Only sent when the visitor ticks the box and so agrees
 * that these details appear in the public GitHub issue.
 */
export type FeedbackContact = {
  consent: true;
  email: string;
  name?: string;
  organisation?: string;
};

export type FeedbackRequest = {
  category: FeedbackCategory;
  message: string;
  /** Path + query of the page the visitor was on. */
  page: string;
  contact?: FeedbackContact;
  /** Honeypot: real visitors leave this empty. */
  website?: string;
};

export type FeedbackResponse = { ok: true; number?: number; url?: string } | { ok: false; error: string };

export function feedbackCategory(value: unknown) {
  return FEEDBACK_CATEGORIES.find((c) => c.value === value);
}
