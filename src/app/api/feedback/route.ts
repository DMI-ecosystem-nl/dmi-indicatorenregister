import {
  FEEDBACK_FALLBACK_EMAIL,
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_MESSAGE_MIN,
  type FeedbackResponse,
  feedbackCategory,
} from "@/lib/feedback";
import { meta } from "@/lib/selectors";

/**
 * Turns feedback from the site into a GitHub issue.
 *
 * Env:
 * - GITHUB_FEEDBACK_TOKEN  fine-grained PAT with only "Issues: read and write" on the repo below.
 * - GITHUB_FEEDBACK_REPO   optional, "owner/name"; defaults to the canonical repo.
 */
const DEFAULT_REPO = "DMI-ecosystem-nl/dmi-indicatorenregister";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
/** Best effort: per server instance, resets on cold start. */
const recent = new Map<string, number[]>();

function json(body: FeedbackResponse, status = 200) {
  return Response.json(body, { status });
}

function fail(error: string, status: number) {
  return json({ ok: false, error }, status);
}

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) return true;
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return false;
}

/** Stop visitors from pinging GitHub users or teams with @mentions. */
function defuseMentions(text: string) {
  return text.replace(/@(?=[A-Za-z0-9_-])/g, "@​");
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Verzoek geweigerd.", 403);

  const token = process.env.GITHUB_FEEDBACK_TOKEN;
  if (!token) {
    return fail(`Feedback versturen is nu niet mogelijk. Mail het DMI-team via ${FEEDBACK_FALLBACK_EMAIL}.`, 503);
  }

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return fail("Het verzoek is ongeldig.", 400);
  }

  // Honeypot filled in: pretend it worked, create nothing.
  if (typeof input.website === "string" && input.website.trim() !== "") return json({ ok: true });

  const category = feedbackCategory(input.category);
  const message = typeof input.message === "string" ? input.message.trim() : "";
  if (!category) return fail("Kies een soort feedback.", 400);
  if (message.length < FEEDBACK_MESSAGE_MIN || message.length > FEEDBACK_MESSAGE_MAX) {
    return fail(`Schrijf een bericht van ${FEEDBACK_MESSAGE_MIN} tot ${FEEDBACK_MESSAGE_MAX} tekens.`, 400);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return fail("Je hebt veel berichten kort na elkaar verstuurd. Probeer het over 10 minuten opnieuw.", 429);
  }

  // Only accept a path on this site; anything else is dropped.
  const siteOrigin = new URL(request.url).origin;
  let pageUrl: URL | null = null;
  if (typeof input.page === "string" && input.page.startsWith("/") && input.page.length <= 500) {
    try {
      const u = new URL(input.page, siteOrigin);
      if (u.origin === siteOrigin) pageUrl = u;
    } catch {
      pageUrl = null;
    }
  }
  const pagePath = pageUrl ? `${pageUrl.pathname}${pageUrl.search}` : null;

  const safeMessage = defuseMentions(message);
  const firstLine = safeMessage.split("\n")[0].trim();
  const summary = firstLine.length > 70 ? `${firstLine.slice(0, 69).trimEnd()}…` : firstLine;
  const title = `${category.label}: ${summary}`;

  const body = [
    `**Soort:** ${category.label}`,
    `**Pagina:** ${pageUrl ? `[${pagePath}](${pageUrl.href})` : "onbekend"}`,
    `**Registerversie:** v${meta.version}`,
    "",
    "---",
    "",
    safeMessage,
    "",
    "---",
    "<sub>Ingediend via de feedbackknop op de website.</sub>",
  ].join("\n");

  const repo = process.env.GITHUB_FEEDBACK_REPO || DEFAULT_REPO;
  const labels = ["feedback", category.githubLabel];

  const create = (withLabels: boolean) =>
    fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "dmi-indicatorenregister-feedback",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(withLabels ? { title, body, labels } : { title, body }),
      signal: AbortSignal.timeout(10_000),
    });

  try {
    let res = await create(true);
    // Labels can be rejected (e.g. missing permission); the issue itself matters more.
    if (res.status === 422) res = await create(false);
    if (!res.ok) {
      console.error("[feedback] GitHub API", res.status, await res.text().catch(() => ""));
      return fail(
        `GitHub heeft de melding niet aangenomen. Probeer het later opnieuw of mail het DMI-team via ${FEEDBACK_FALLBACK_EMAIL}.`,
        502,
      );
    }
    const issue = (await res.json()) as { number: number; html_url: string };
    return json({ ok: true, number: issue.number, url: issue.html_url }, 201);
  } catch (err) {
    console.error("[feedback] GitHub request failed", err);
    return fail(
      `We konden GitHub niet bereiken. Probeer het later opnieuw of mail het DMI-team via ${FEEDBACK_FALLBACK_EMAIL}.`,
      502,
    );
  }
}
