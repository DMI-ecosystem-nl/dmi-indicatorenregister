import { createSign } from "node:crypto";

/**
 * Token for the GitHub REST API, server-side only.
 *
 * Preferred: a GitHub App installation (no yearly renewal).
 * - GITHUB_APP_ID               numeric App ID
 * - GITHUB_APP_INSTALLATION_ID  numeric installation ID for the organisation
 * - GITHUB_APP_PRIVATE_KEY      the App's .pem, base64-encoded (or the PEM itself, `\n` allowed)
 *
 * Fallback: GITHUB_FEEDBACK_TOKEN (fine-grained PAT).
 */

const API = "https://api.github.com";
/** Refresh a little before GitHub's 1-hour expiry. */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

let cached: { token: string; expiresAt: number } | null = null;
let pending: Promise<string> | null = null;

function privateKey(raw: string) {
  const value = raw.trim();
  if (value.includes("-----BEGIN")) return value.replace(/\\n/g, "\n");
  return Buffer.from(value, "base64").toString("utf8");
}

function appJwt(appId: string, key: string) {
  const encode = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  // iat 60 s in the past against clock drift; GitHub allows at most 10 minutes.
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iat: now - 60, exp: now + 540, iss: appId })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(key, "base64url");
  return `${unsigned}.${signature}`;
}

async function installationToken(appId: string, installationId: string, rawKey: string) {
  const res = await fetch(`${API}/app/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${appJwt(appId, privateKey(rawKey))}`,
      "User-Agent": "dmi-feedback",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`GitHub App token: ${res.status} ${await res.text().catch(() => "")}`);
  }
  const data = (await res.json()) as { token: string; expires_at: string };
  cached = { token: data.token, expiresAt: Date.parse(data.expires_at) };
  return data.token;
}

/** Whether any credential is configured; no network call. */
export function hasGitHubCredentials() {
  const { GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY } = process.env;
  return Boolean(
    (GITHUB_APP_ID && GITHUB_APP_INSTALLATION_ID && GITHUB_APP_PRIVATE_KEY) ||
      process.env.GITHUB_FEEDBACK_TOKEN,
  );
}

/** A usable token, or `null` when nothing is configured. Throws when the App is configured but GitHub refuses it. */
export async function getGitHubToken(): Promise<string | null> {
  const { GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY } = process.env;
  if (GITHUB_APP_ID && GITHUB_APP_INSTALLATION_ID && GITHUB_APP_PRIVATE_KEY) {
    if (cached && cached.expiresAt - Date.now() > REFRESH_MARGIN_MS) return cached.token;
    pending ??= installationToken(GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY).finally(
      () => {
        pending = null;
      },
    );
    return pending;
  }
  return process.env.GITHUB_FEEDBACK_TOKEN || null;
}
