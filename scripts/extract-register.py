#!/usr/bin/env python3
"""
Extract the DMI Indicatorenregister from the source documents in source-docs/
into src/data/generated/register.ts.

Run with `npm run extract` after any revision of the sources.

Sources
-------
* Excel "Uitdraai <versie> ... register" — the register itself. One sheet with
  every Geschikt and Gewenst indicator and its metadata. The file with the
  highest version number in its name wins (v0.96 on 22-11-2026). This is the
  ONLY source of indicator content: names, assessment, domains, source links,
  descriptions, metadata, Blauwdruk G40 links and the monitoringsvragen they
  answer. Older register versions (v0.9 Excel, v0.91 PDF, v0.94 uitdraai) are
  no longer read for indicator content.
* Excel "DMI Indicatorenregister - werkbaar concept" — background that the
  uitdraai does not hold:
  - "Blauwdruk G40 vertaling": the G40 Blauwdruk actions with goals/approach/data.
  - "V83C": the full wording (kernvraag, variaties) of the monitoringsvragen.
  - "Introductie": intro text, geschiktheid definitions, phase status per
    domain and the process timeline.

The uitdraai says "Geschikt" where older versions said "Goed"; the data keeps
the internal key "goed" (the site labels it "Geschikt").

Columns holding personal names or informal session notes are not exported.
"""

from __future__ import annotations

import collections
import datetime as dt
import fnmatch
import json
import re
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:  # pragma: no cover
    sys.exit("openpyxl is required:  pip3 install openpyxl")

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "source-docs"
OUT = ROOT / "src" / "data" / "generated" / "register.ts"

GESCHIKTHEID = ("goed", "gewenst", "beperkt", "niet")
DOMAIN_CODES = ["A", "B", "C", "D", "E", "F", "G", "H", "X"]
ACTION_DOMAIN_COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H"]  # ✓ columns in the vertaling sheet

warnings: list[str] = []


def warn(msg: str) -> None:
    warnings.append(msg)


# --------------------------------------------------------------------------- helpers


def sources(pattern: str) -> list[Path]:
    return sorted(
        p
        for p in DOCS.iterdir()
        if not p.name.startswith("~$")  # Office lock file of a document that is open
        and fnmatch.fnmatch(p.name.lower(), pattern.lower())
    )


def find_source(pattern: str) -> Path:
    matches = sources(pattern)
    if not matches:
        sys.exit(f"No source matching {pattern!r} in {DOCS}")
    return matches[-1]


def find_uitdraai() -> Path:
    """The 'Uitdraai' Excel with the highest version number in its file name."""

    def version(p: Path) -> tuple[int, ...]:
        m = re.search(r"(\d+)\.(\d+)", p.name)
        return (int(m.group(1)), int(m.group(2))) if m else (0, 0)

    matches = sources("*uitdraai*.xlsx")
    if not matches:
        sys.exit(f"No 'Uitdraai' Excel in {DOCS}")
    return max(matches, key=version)


def clean(value) -> str | None:
    """Normalise a cell to a trimmed string; 0/empty/None become None."""
    if value is None:
        return None
    if isinstance(value, (int, float)) and not isinstance(value, bool) and value == 0:
        return None
    text = str(value).replace("\xa0", " ").replace("\r", "")
    text = "\n".join(re.sub(r"[ \t]+", " ", line).strip() for line in text.split("\n"))
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text or None


def unclear(text: str | None) -> bool:
    return (text or "").lower().rstrip("?") == "onduidelijk"


def domain_code(value) -> str | None:
    m = re.match(r"^([A-HX])\.", clean(value) or "")
    return m.group(1) if m else None


def geschiktheid(value) -> str | None:
    text = (clean(value) or "").lower()
    if text == "geschikt":
        return "goed"
    return text if text in GESCHIKTHEID else None


def ja_nee(value) -> str | None:
    text = (clean(value) or "").lower().rstrip("?")
    if not text or text in ("nvt", "n.v.t."):
        return None
    if text.startswith("ja"):
        return "ja"
    if text.startswith("nee"):
        return "nee"
    if text.startswith("beperkt"):
        return "beperkt"
    return "onduidelijk"


def split_codes(value) -> list[str]:
    codes = re.findall(r"\b([A-F]\d+(?:\.\d+)?)\b", clean(value) or "")
    return list(dict.fromkeys(codes))


def indicator_type(value) -> int | None:
    m = re.match(r"^(\d)\.", clean(value) or "")
    return int(m.group(1)) if m else None


def year(value) -> int | None:
    if isinstance(value, (int, float)) and 1900 < value < 2100:
        return int(value)
    m = re.search(r"(19|20)\d\d", clean(value) or "")
    return int(m.group(0)) if m else None


def capitalise(text: str | None) -> str | None:
    return text[0].upper() + text[1:] if text else text


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def link_cell(cell) -> str | None:
    """URL of a cell holding a typed URL and/or a hyperlink.

    The URL typed in the cell wins: in the uitdraai many cells carry a stale
    hyperlink (copied along with the cell formatting) that points elsewhere,
    and openpyxl drops the #fragment of hyperlink targets (CBS/RIVM statline
    deep links live there). The hyperlink is used when the cell holds a label.
    """
    typed = re.search(r"https?://\S+", clean(cell.value) or "")
    if typed:
        return typed.group(0).rstrip(").,;")
    if cell.hyperlink and cell.hyperlink.target:
        return cell.hyperlink.target
    return None


# --------------------------------------------------------------------------- register (uitdraai)


def read_register(path: Path) -> dict:
    """Read the 'Uitdraai': title block, header row with IDs, one row per indicator."""
    import warnings as pywarnings

    pywarnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")
    ws = openpyxl.load_workbook(path, data_only=True).worksheets[0]
    rows = list(ws.iter_rows(max_col=80))
    header_row = next(i for i, r in enumerate(rows) if any(c.value == "Indicator_ID" for c in r))
    header: dict[str, int] = {}
    for i, c in enumerate(rows[header_row]):
        n = clean(c.value)
        if n and n not in header:
            header[n] = i
    # The ✓ columns "A. Bouwen" … "X. Context (Overig)": the domains an indicator is relevant to.
    domain_cols = [(domain_code(n), i) for n, i in header.items() if domain_code(n) and n != "Hoofd-DMI-domein"]
    if sorted(c for c, _ in domain_cols) != DOMAIN_CODES:
        warn(f"unexpected domain columns: {[c for c, _ in domain_cols]}")

    title = " ".join(clean(c.value) or "" for r in rows[:header_row] for c in r if isinstance(c.value, str))
    m = re.search(r"[Vv]ersie\s+(\d+\.\d+)\s*-\s*(\d{1,2})-(\d{1,2})-(\d{4})", title)
    version = m.group(1) if m else (re.search(r"(\d+\.\d+)", path.name) or [None, ""])[1]
    date = f"{m.group(4)}-{int(m.group(3)):02d}-{int(m.group(2)):02d}" if m else ""

    def cell(row, name):
        if name not in header:
            sys.exit(f"Column {name!r} missing in {path.name}")
        return row[header[name]]

    def val(row, name):
        return clean(cell(row, name).value)

    def text(row, name):
        """Free text; 'onduidelijk' is kept as the source states it."""
        return capitalise(val(row, name))

    out = []
    seen: collections.Counter[str] = collections.Counter()
    for row in rows[header_row + 1 :]:
        ind_id = val(row, "Indicator_ID")
        name = val(row, "Indicator")
        if not ind_id or not name:
            continue
        g = geschiktheid(cell(row, "Geschiktheid").value)
        if g not in ("goed", "gewenst"):
            warn(f"{ind_id}: geschiktheid {val(row, 'Geschiktheid')!r} — skipped")
            continue
        seen[ind_id] += 1
        suffix = "" if seen[ind_id] == 1 else chr(ord("a") + seen[ind_id] - 1)
        if suffix:
            warn(f"{ind_id}: duplicate ID → slug suffix '{suffix}' ({name})")

        relevant = [code for code, i in sorted(domain_cols) if row[i].value is True]
        hoofd = domain_code(cell(row, "Hoofd-DMI-domein").value)
        if not hoofd:
            if not relevant:
                warn(f"{ind_id}: no Hoofd-DMI-domein and no domain ticked — skipped")
                continue
            hoofd = relevant[0]
            warn(f"{ind_id}: no Hoofd-DMI-domein — using first ticked domain {hoofd} ({name})")
        domains = [hoofd] + [c for c in relevant if c != hoofd]

        bron_url = link_cell(cell(row, "Brondata"))
        beschrijving = val(row, "Bron beschrijving")
        if unclear(beschrijving):
            beschrijving = None

        norm = None
        if (val(row, "Norm (Ja/Nee)") or "").lower().startswith("ja"):
            norm = {
                "waarde": val(row, "Normwaarde"),
                "jaar": year(cell(row, "Norm jaar").value),
                "bron": val(row, "Norm bron"),
            }

        recent_raw = val(row, "Meest recent jaar")
        recent = year(cell(row, "Meest recent jaar").value)
        if recent is None and recent_raw:
            recent = "onduidelijk" if unclear(recent_raw) else None
            if recent is None:
                warn(f"{ind_id}: Meest recent jaar {recent_raw!r} not understood")

        out.append(
            {
                "slug": slugify(ind_id) + suffix,
                "id": ind_id,
                "name": name,
                "geschiktheid": g,
                "vraagId": val(row, "Monitoringsvraag_ID"),
                "_vraagTitle": val(row, "Monitoringsvraag"),
                "domain": hoofd,
                "domains": domains,
                "blauwdruk": split_codes(cell(row, "Blauwdruk G40").value),
                "type": indicator_type(cell(row, "Indicator type").value),
                "bron": val(row, "Dashboard"),
                "bronUrl": bron_url,
                "beschrijving": beschrijving,
                "modelMeting": text(row, "Model / Meting"),
                "openbaar": ja_nee(cell(row, "Openbaar toegankelijk").value),
                "vrijGebruik": ja_nee(cell(row, "Data vrij te gebruiken").value),
                "voorwaarden": text(row, "Onder welke voorwaarden"),
                "beheerder": val(row, "Indicator beheerder"),
                "frequentie": val(row, "Frequentie"),  # lowercase: matches taxonomy.frequentieOrder
                "meestRecentJaar": recent,
                "typeData": text(row, "Type data"),
                "laagsteSchaal": text(row, "Laagste schaalniveau"),
                "dekking": text(row, "Dekking"),
                "historie": ja_nee(cell(row, "Historie").value),
                "dataverzamelaar": val(row, "Dataverzamelaar"),
                "prognose": text(row, "Prognose"),
                "eenheid": val(row, "Eenheid"),
                "meetmethode": val(row, "Meetmethode"),
                "norm": norm,
            }
        )
    return {"version": version, "date": date, "rows": out, "file": path.name}


# --------------------------------------------------------------------------- base Excel (background)


def read_actions(wb) -> list[dict]:
    ws = wb["Blauwdruk G40 vertaling"]
    out = []
    for row in list(ws.iter_rows(values_only=True))[2:]:
        if len(row) < 16 or not clean(row[2]):
            continue
        action_id = clean(row[2])
        if not re.match(r"^[A-F]\d+(\.\d+)?$", action_id):
            continue
        domains = [code for code, cell in zip(ACTION_DOMAIN_COLUMNS, row[7:15]) if clean(cell)]
        out.append(
            {
                "id": action_id,
                "slug": slugify(action_id),
                "actielijn": action_id[0],
                "text": clean(row[3]) or "",
                "doelen": clean(row[4]),
                "aanpak": clean(row[5]),
                "benodigdeData": clean(row[6]),
                "dataSamengevat": clean(row[15]),
                "domains": domains,
                "vraagIds": [],
            }
        )

    def sort_key(a):
        nums = [int(n) for n in re.findall(r"\d+", a["id"])]
        return (a["actielijn"], nums)

    return sorted(out, key=sort_key)


def read_v83c(wb) -> dict[str, dict]:
    ws = wb["V83C"]
    out = {}
    for row in list(ws.iter_rows(values_only=True))[3:]:
        vid = clean(row[2]) if len(row) > 2 else None
        if not vid or not vid.startswith("V."):
            continue
        out[vid] = {"kern": clean(row[3]), "variaties": clean(row[4])}
    return out


def read_meta(wb, register: dict) -> dict:
    ws = wb["Introductie"]

    def v(ref):
        return ws[ref].value

    defs = {}
    for ref, key in (("C22", "goed"), ("C23", "gewenst"), ("C24", "beperkt"), ("C25", "niet")):
        text = clean(v(ref)) or ""
        defs[key] = re.sub(r"^\w+:\s*", "", text).replace("crusicale", "cruciale")

    phase_names = [clean(ws.cell(row=8, column=c).value) for c in range(3, 10)]
    phase_codes = [clean(ws.cell(row=9, column=c).value) for c in range(3, 10)]
    phases = [{"code": code or "", "name": name or ""} for code, name in zip(phase_codes, phase_names)]
    status = []
    for r in range(11, 19):
        dom = clean(ws.cell(row=r, column=2).value)
        if dom:
            status.append(
                {"domain": dom, "statuses": [clean(ws.cell(row=r, column=c).value) for c in range(3, 10)]}
            )

    timeline = []
    for r in range(23, 60):
        date, title = ws.cell(row=r, column=12).value, clean(ws.cell(row=r, column=13).value)
        if isinstance(date, dt.datetime) and title:
            if title.count("(") > title.count(")"):
                title += ")"
            timeline.append({"date": date.date().isoformat(), "title": title.replace("Gezonheid", "Gezondheid")})

    base_date = v("C4")
    base_date_iso = base_date.date().isoformat() if isinstance(base_date, dt.datetime) else ""
    return {
        "version": register["version"],
        "versionDate": register["date"],
        "sources": [
            {"version": register["version"], "date": register["date"], "format": "xlsx",
             "title": "Uitdraai DMI indicatorenregister",
             "role": "Het register: alle indicatoren met geschiktheid, domeinen, bron, beschrijving en metadata."},
            {"version": None, "date": base_date_iso, "format": "xlsx",
             "title": "DMI Indicatorenregister – werkbaar concept",
             "role": "Achtergrond: Blauwdruk G40-vertaling, formulering van de monitoringsvragen en het proces."},
        ],
        "backgroundDate": base_date_iso,
        "intro": clean(v("K2")) or "",
        "geschiktheidDefinitions": defs,
        "phases": phases,
        "phaseStatus": status,
        "timeline": timeline,
    }


# --------------------------------------------------------------------------- assemble


def build_questions(indicators, v83c) -> list[dict]:
    groups = collections.OrderedDict()
    for ind in indicators:
        groups.setdefault(ind["vraagId"], []).append(ind)

    out = []
    for vid, items in groups.items():
        titles = list(dict.fromkeys(i["_vraagTitle"] for i in items if i["_vraagTitle"]))
        if len(titles) > 1:
            warn(f"{vid}: several titles {titles} — using the first")
        counts = {g: sum(1 for i in items if i["geschiktheid"] == g) for g in ("goed", "gewenst")}
        codes: list[str] = []
        for i in items:
            codes += [c for c in i["blauwdruk"] if c not in codes]
        num = int(re.sub(r"\D", "", vid) or 0)
        out.append(
            {
                "id": vid,
                "slug": slugify(vid),
                "title": titles[0] if titles else vid,
                "kernvraag": (v83c.get(vid) or {}).get("kern"),
                "variaties": (v83c.get(vid) or {}).get("variaties"),
                "domains": list(dict.fromkeys(i["domain"] for i in items)),
                "blauwdruk": codes,
                "indicatorSlugs": [i["slug"] for i in items],
                "counts": counts,
                "wensenlijst": num >= 700,
            }
        )
    out.sort(key=lambda q: q["id"])
    return out


def ts(value) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2)


def main() -> None:
    register_path = find_uitdraai()
    base_path = find_source("*indicatorenregister*werkbaar concept*.xlsx")
    print(f"Register:   {register_path.name}\nBackground: {base_path.name}")

    import warnings as pywarnings

    pywarnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")
    wb = openpyxl.load_workbook(base_path, data_only=True)

    register = read_register(register_path)
    indicators = register["rows"]
    actions = read_actions(wb)
    v83c = read_v83c(wb)
    meta = read_meta(wb, register)

    for ind in indicators:
        if not ind["vraagId"]:
            sys.exit(f"{ind['id']}: no Monitoringsvraag_ID")
    questions = build_questions(indicators, v83c)
    action_ids = {a["id"] for a in actions}
    for q in questions:
        for code in q["blauwdruk"]:
            if code not in action_ids:
                warn(f"{q['id']}: unknown Blauwdruk action {code}")
    for a in actions:
        a["vraagIds"] = [q["id"] for q in questions if a["id"] in q["blauwdruk"]]

    for ind in indicators:
        ind.pop("_vraagTitle", None)
        if not ind["bronUrl"] and ind["geschiktheid"] == "goed":
            warn(f"{ind['id']}: no source link ({ind['name']})")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    generated = dt.date.today().isoformat()
    OUT.write_text(
        f"""// ============================================================
// AUTO-GENERATED — do not edit.
//
// Generated by scripts/extract-register.py on {generated} from
//   {register_path.name}  (register)
//   {base_path.name}  (background)
// Re-run `npm run extract` after any revision of these sources.
//
// Labels, colours and display taxonomy live in ../taxonomy.ts and are
// maintained by hand.
// ============================================================

import type {{
  BlueprintAction,
  Indicator,
  MonitoringQuestion,
  RegisterMeta,
}} from "../types";

export const meta: RegisterMeta = {ts(meta)};

export const indicators: Indicator[] = {ts(indicators)};

export const questions: MonitoringQuestion[] = {ts(questions)};

export const actions: BlueprintAction[] = {ts(actions)};
""",
        encoding="utf-8",
    )

    # ------------------------------------------------------------------ report
    reg = collections.Counter(i["geschiktheid"] for i in indicators)
    print(f"\nRegister v{register['version']} ({register['date']}): {len(indicators)} indicators — "
          f"geschikt {reg['goed']}, gewenst {reg['gewenst']}")
    print(f"  with description: {sum(1 for i in indicators if i['beschrijving'])}, "
          f"with source link: {sum(1 for i in indicators if i['bronUrl'])}, "
          f"relevant to >1 domain: {sum(1 for i in indicators if len(i['domains']) > 1)}")
    print(f"Monitoringsvragen: {len(questions)} (with kernvraag: {sum(1 for q in questions if q['kernvraag'])})")
    print(f"Blauwdruk acties: {len(actions)} (with vragen: {sum(1 for a in actions if a['vraagIds'])})")
    print(f"Timeline events: {len(meta['timeline'])}")
    if warnings:
        print(f"\n{len(warnings)} warnings:")
        for w in warnings:
            print("  - " + w)
    print(f"\nWrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
