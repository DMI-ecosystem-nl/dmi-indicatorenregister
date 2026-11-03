const MONTHS = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

/** "2026-10-14" → "14 oktober 2026" (deterministic, no locale/timezone drift). */
export function formatDate(iso: string, opts: { short?: boolean } = {}): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const month = MONTHS[Number(m[2]) - 1];
  return `${Number(m[3])} ${opts.short ? month.slice(0, 3) : month} ${m[1]}`;
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}
