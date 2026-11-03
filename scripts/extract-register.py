#!/usr/bin/env python3
"""
Extract the DMI Indicatorenregister from the source documents in source-docs/
into src/data/generated/register.ts.

Run with `npm run extract` after any revision of the sources.

Sources
-------
* Excel "DMI Indicatorenregister - werkbaar concept" (v0.9) — the base. Sheets:
  - "Indicatoren beoordeling": every assessed indicator (300+) with metadata.
    Source links are cell *hyperlinks* in the IND_Brondata column.
  - "Blauwdruk G40 vertaling": the G40 Blauwdruk actions with goals/approach/data.
  - "Blauwdruk G40 & DMI indicatoren": monitoringsvraag x action matrix.
  - "V83C": core monitoring questions with their variations.
  - "Introductie": intro text, phase status per domain and the process timeline.
* PDF "DMI indicatorenregister v0.91 concept" — newer printout of the register
  (Goed + Gewenst only). Overlays the current geschiktheid and the "Indeling"
  code (A01 ...) onto the Excel records.

Columns holding personal names or informal session notes (Kevin/Eric,
Ingevoerd door, expert-session notes) are deliberately not exported.
"""

from __future__ import annotations

import collections
import csv
import datetime as dt
import difflib
import io
import json
import re
import subprocess
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
DOMAIN_COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H"]  # order of ✓ columns in vertaling

warnings: list[str] = []


def warn(msg: str) -> None:
    warnings.append(msg)


# --------------------------------------------------------------------------- helpers


def find_source(pattern: str) -> Path:
    matches = sorted(DOCS.glob(pattern))
    if not matches:
        sys.exit(f"No source matching {pattern!r} in {DOCS}")
    return matches[-1]


def clean(value) -> str | None:
    """Normalise a cell to a trimmed string; 0/empty/None become None."""
    if value is None:
        return None
    if isinstance(value, (int, float)) and value == 0:
        return None
    text = str(value).replace("\xa0", " ").replace("\r", "")
    text = "\n".join(re.sub(r"[ \t]+", " ", line).strip() for line in text.split("\n"))
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text or None


def domain_code(value) -> str | None:
    text = clean(value)
    if not text:
        return None
    m = re.match(r"^([A-HX])\.", text)
    return m.group(1) if m else None


def geschiktheid(value) -> str | None:
    text = (clean(value) or "").lower()
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
    text = clean(value)
    if not text:
        return []
    codes = re.findall(r"\b([A-F]\d+(?:\.\d+)?)\b", text)
    return list(dict.fromkeys(codes))


def indicator_type(value) -> int | None:
    text = clean(value)
    if not text:
        return None
    m = re.match(r"^(\d)\.", text)
    return int(m.group(1)) if m else None


def year(value) -> int | None:
    if isinstance(value, (int, float)) and 1900 < value < 2100:
        return int(value)
    m = re.search(r"(19|20)\d\d", clean(value) or "")
    return int(m.group(0)) if m else None


def norm(text: str | None) -> str:
    return re.sub(r"[^a-z0-9]+", "", (text or "").lower())


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


# --------------------------------------------------------------------------- Excel


def header_index(row) -> dict[str, int]:
    return {str(h).strip(): i for i, h in enumerate(row) if h not in (None, "")}


def read_indicators(wb) -> list[dict]:
    ws_values = wb["Indicatoren beoordeling"]
    rows = list(ws_values.iter_rows())
    header = header_index([c.value for c in rows[1]])

    def col(row, name):
        return row[header[name]].value if name in header else None

    out: list[dict] = []
    seen: collections.Counter[str] = collections.Counter()
    for row in rows[2:]:
        ind_id = clean(col(row, "IND_ID"))
        name = clean(col(row, "Indicator"))
        if not ind_id:
            continue
        if not name:
            warn(f"{ind_id}: no indicator name — skipped")
            continue
        seen[ind_id] += 1
        suffix = "" if seen[ind_id] == 1 else chr(ord("a") + seen[ind_id] - 1)
        if suffix:
            warn(f"{ind_id}: duplicate ID in Excel → slug suffix '{suffix}' ({name})")
        g = geschiktheid(col(row, "Geschiktheid"))
        if not g:
            warn(f"{ind_id}: unknown geschiktheid {col(row, 'Geschiktheid')!r}")
            continue
        dom = domain_code(col(row, "DMI-domein"))
        if not dom:
            warn(f"{ind_id}: unknown domain {col(row, 'DMI-domein')!r}")
            continue

        bron_cell = row[header["IND_Brondata"]]
        bron_text = clean(bron_cell.value)
        bron_url = bron_cell.hyperlink.target if bron_cell.hyperlink and bron_cell.hyperlink.target else None
        embedded = re.search(r"https?://\S+", bron_text or "")
        if not bron_url and embedded:
            bron_url = embedded.group(0).rstrip(").,;")
        bron_label = bron_text
        if bron_label and embedded:
            bron_label = clean(bron_label.replace(embedded.group(0), "")) or re.sub(
                r"^https?://(www\.)?([^/]+).*$", r"\2", embedded.group(0)
            )

        hist_raw = clean(col(row, "Historie"))
        historie = None
        if hist_raw:
            historie = hist_raw.lower().startswith("ja")
        frequentie = clean(col(row, "Frequentie"))

        out.append(
            {
                "slug": slugify(ind_id) + suffix,
                "id": ind_id,
                "indeling": None,
                "name": name,
                "geschiktheid": g,
                "geschiktheidV09": None,
                "inRegister": False,
                "toelichting": clean(col(row, "Toelichting geschiktheid")),
                "benodigdVoorGoed": clean(col(row, "Benodigd voor 'Goed'")),
                "vraagId": clean(col(row, "Monitoringsvraag_ID")),
                "_vraagTitle": clean(col(row, "Monitoringsvraag")),
                "domain": dom,
                "domainV09": None,
                "domain2": domain_code(col(row, "DMI-domein 2_optioneel")),
                "cluster": clean(col(row, "Thematische cluster")),
                "blauwdruk": split_codes(col(row, "Blauwdruk G40")),
                "type": indicator_type(col(row, "Indicator_Type")),
                "bron": clean(col(row, "IND_Dashboard")),
                "bronUrl": bron_url,
                "bronLabel": bron_label,
                "dataverzamelaar": clean(col(row, "Verantwoordelijke dataverzamelaar")),
                "openbaar": ja_nee(col(row, "Openbaar toegankelijk")),
                "vrijGebruik": ja_nee(col(row, "Data vrij te gebruiken")),
                "voorwaarden": None
                if (clean(col(row, "Onder welke voorwaarden")) or "").lower() in ("", "nvt")
                else clean(col(row, "Onder welke voorwaarden")),
                "eenheid": None
                if (clean(col(row, "Eenheid")) or "").upper() == "NVT"
                else clean(col(row, "Eenheid")),
                "frequentie": frequentie,
                "meestRecentJaar": year(col(row, "Meest recent jaar")),
                "schaalniveau": clean(col(row, "Schaal niveau (CBS)")),
                "laagsteSchaal": clean(col(row, "Laagste schaalniveau")),
                "historie": historie,
                "historieNote": hist_raw if hist_raw and hist_raw.lower() not in ("ja", "nee") else None,
                "prognose": clean(col(row, "Prognose")),
            }
        )
    return out


def read_actions(wb) -> list[dict]:
    ws = wb["Blauwdruk G40 vertaling"]
    out = []
    for row in list(ws.iter_rows(values_only=True))[2:]:
        if len(row) < 16 or not clean(row[2]):
            continue
        action_id = clean(row[2])
        if not re.match(r"^[A-F]\d+(\.\d+)?$", action_id):
            continue
        domains = [code for code, cell in zip(DOMAIN_COLUMNS, row[7:15]) if clean(cell)]
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


def read_matrix(wb) -> dict[str, dict]:
    """monitoringsvraag ID → {title, codes} from the Blauwdruk x vraag matrix."""
    ws = wb["Blauwdruk G40 & DMI indicatoren"]
    rows = list(ws.iter_rows(values_only=True))
    header = rows[3]
    action_cols = [
        (i, str(h)) for i, h in enumerate(header) if h and re.match(r"^[A-F]\d+(\.\d+)?$", str(h))
    ]
    out = {}
    for row in rows[4:]:
        vid = clean(row[1])
        if not vid or not vid.startswith("V."):
            continue
        codes = [code for i, code in action_cols if i < len(row) and clean(row[i])]
        codes += [c for c in split_codes(row[5]) if c not in codes]
        out[vid] = {"kern": clean(row[3]), "codes": codes}
    return out


def read_v83c(wb) -> dict[str, dict]:
    ws = wb["V83C"]
    out = {}
    for row in list(ws.iter_rows(values_only=True))[3:]:
        vid = clean(row[2]) if len(row) > 2 else None
        if not vid or not vid.startswith("V."):
            continue
        out[vid] = {"kern": clean(row[3]), "variaties": clean(row[4])}
    return out


def read_meta(wb, excel_path: Path, pdf_path: Path) -> dict:
    ws = wb["Introductie"]

    def v(ref):
        return ws[ref].value

    excel_date = v("C4")
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

    m = re.search(r"(\d{1,2})-(\d{1,2})-(\d{4}).*?v(\d+\.\d+)", pdf_path.name)
    pdf_date = f"{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}" if m else ""
    return {
        "excelVersion": clean(v("C3")) or "",
        "excelDate": excel_date.date().isoformat() if isinstance(excel_date, dt.datetime) else "",
        "pdfVersion": m.group(4) if m else "",
        "pdfDate": pdf_date,
        "intro": clean(v("K2")) or "",
        "geschiktheidDefinitions": defs,
        "phases": phases,
        "phaseStatus": status,
        "timeline": timeline,
    }


# --------------------------------------------------------------------------- PDF overlay

# Column boundaries (x in pt) of the v0.91 printout table.
PDF_COLUMNS = [("domein", 0), ("vraag", 110), ("indicator", 200), ("bron", 365), ("geschiktheid", 430), ("indeling", 480)]


def pdf_column(x: float) -> str:
    name = PDF_COLUMNS[0][0]
    for col, start in PDF_COLUMNS:
        if x >= start:
            name = col
    return name


def read_pdf(pdf_path: Path) -> list[dict]:
    try:
        tsv = subprocess.run(
            ["pdftotext", "-tsv", str(pdf_path), "-"], check=True, capture_output=True, text=True
        ).stdout
    except (OSError, subprocess.CalledProcessError) as exc:  # pragma: no cover
        sys.exit(f"pdftotext (poppler) is required to read the PDF: {exc}")

    words = []
    for rec in csv.DictReader(io.StringIO(tsv), delimiter="\t", quoting=csv.QUOTE_NONE):
        if rec["level"] != "5" or rec["text"].startswith("###"):
            continue
        words.append((int(rec["page_num"]), float(rec["top"]), float(rec["left"]), rec["text"]))
    words.sort()

    # Group words into visual lines (same page, |dy| < 2pt).
    lines: list[list[tuple]] = []
    for w in words:
        if lines and lines[-1][0][0] == w[0] and abs(lines[-1][0][1] - w[1]) < 2:
            lines[-1].append(w)
        else:
            lines.append([w])

    records: list[dict] = []
    current = None
    for line in lines:
        cells: dict[str, list[str]] = collections.defaultdict(list)
        for _, _, x, text in sorted(line, key=lambda w: w[2]):
            cells[pdf_column(x)].append(text)
        code = " ".join(cells.get("indeling", []))
        if re.fullmatch(r"[A-HX]\d+", code):
            current = {k: " ".join(v) for k, v in cells.items()}
            records.append(current)
        elif current is not None and line[0][1] > 80:  # continuation of a wrapped cell
            for k, v in cells.items():
                if k in ("domein", "indeling"):
                    continue
                current[k] = (current.get(k, "") + " " + " ".join(v)).strip()

    out = []
    for r in records:
        g = geschiktheid(r.get("geschiktheid"))
        if not g:
            warn(f"PDF row {r.get('indeling')}: unknown geschiktheid {r.get('geschiktheid')!r}")
            continue
        out.append(
            {
                "indeling": r["indeling"],
                "domain": r["indeling"][0],
                "vraag": r.get("vraag", "").strip(),
                "indicator": r.get("indicator", "").strip(),
                "bron": r.get("bron", "").strip(),
                "geschiktheid": g,
            }
        )
    return out


def overlay_pdf(indicators: list[dict], pdf_rows: list[dict]) -> dict:
    """Match every v0.91 row to one Excel record and overlay its assessment.

    v0.91 re-assigned several indicators to another DMI-domein ("DMI domein
    nieuw"), so candidates are searched across all domains; the domain itself
    is taken from the Indeling code letter.
    """
    used: set[str] = set()
    unmatched = []
    changed = []
    moved = []

    def name_ratio(ind, row):
        return difflib.SequenceMatcher(None, norm(ind["name"]), norm(row["indicator"])).ratio()

    def score(ind, row):
        s = name_ratio(ind, row)
        s += 0.25 * difflib.SequenceMatcher(None, norm(ind["_vraagTitle"]), norm(row["vraag"])).ratio()
        s += 0.15 * (norm(ind["bron"]) == norm(row["bron"]))
        s += 0.10 * (ind["geschiktheid"] in ("goed", "gewenst"))
        s += 0.05 * (ind["domain"] == row["domain"])
        return s

    for row in pdf_rows:
        candidates = [i for i in indicators if i["slug"] not in used]
        best = max(candidates, key=lambda i: score(i, row), default=None)
        if not best or name_ratio(best, row) < 0.6:
            unmatched.append(row)
            continue
        used.add(best["slug"])
        best["indeling"] = row["indeling"]
        best["inRegister"] = True
        if best["geschiktheid"] != row["geschiktheid"]:
            changed.append((best["id"], best["name"], best["geschiktheid"], row["geschiktheid"]))
            best["geschiktheidV09"] = best["geschiktheid"]
            best["geschiktheid"] = row["geschiktheid"]
        if best["domain"] != row["domain"]:
            moved.append((best["id"], best["name"], best["domain"], row["domain"]))
            best["domainV09"] = best["domain"]
            best["domain"] = row["domain"]

    # Goed/Gewenst in v0.9 but absent from v0.91 → keep v0.9 assessment, flag.
    dropped = [i for i in indicators if i["geschiktheid"] in ("goed", "gewenst") and not i["inRegister"]]
    return {"unmatched": unmatched, "changed": changed, "dropped": dropped, "moved": moved}


# --------------------------------------------------------------------------- assemble


def build_questions(indicators, matrix, v83c) -> list[dict]:
    groups = collections.OrderedDict()
    for ind in indicators:
        groups.setdefault(ind["vraagId"], []).append(ind)

    out = []
    for vid, items in groups.items():
        counts = {g: sum(1 for i in items if i["geschiktheid"] == g) for g in GESCHIKTHEID}
        domains = list(dict.fromkeys(i["domain"] for i in items))
        codes = list((matrix.get(vid) or {}).get("codes") or [])
        for i in items:
            codes += [c for c in i["blauwdruk"] if c not in codes]
        num = int(re.sub(r"\D", "", vid) or 0)
        out.append(
            {
                "id": vid,
                "slug": slugify(vid),
                "title": items[0]["_vraagTitle"] or vid,
                "kernvraag": (v83c.get(vid) or {}).get("kern") or (matrix.get(vid) or {}).get("kern"),
                "variaties": (v83c.get(vid) or {}).get("variaties"),
                "domains": domains,
                "blauwdruk": codes,
                "indicatorSlugs": [i["slug"] for i in items],
                "counts": counts,
                "inRegister": counts["goed"] + counts["gewenst"] > 0,
                "wensenlijst": num >= 700,
            }
        )
    out.sort(key=lambda q: q["id"])
    return out


def ts(value) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2)


def main() -> None:
    excel_path = find_source("*Indicatorenregister*.xlsx")
    pdf_path = find_source("*indicatorenregister*.pdf")
    print(f"Excel: {excel_path.name}\nPDF:   {pdf_path.name}")

    import warnings as pywarnings

    pywarnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")
    wb = openpyxl.load_workbook(excel_path, data_only=True)

    indicators = read_indicators(wb)
    actions = read_actions(wb)
    matrix = read_matrix(wb)
    v83c = read_v83c(wb)
    meta = read_meta(wb, excel_path, pdf_path)

    before = collections.Counter(i["geschiktheid"] for i in indicators)
    pdf_rows = read_pdf(pdf_path)
    report = overlay_pdf(indicators, pdf_rows)
    after = collections.Counter(i["geschiktheid"] for i in indicators)

    questions = build_questions(indicators, matrix, v83c)
    action_ids = {a["id"] for a in actions}
    for q in questions:
        for code in q["blauwdruk"]:
            if code not in action_ids:
                warn(f"{q['id']}: unknown Blauwdruk action {code}")
    for a in actions:
        a["vraagIds"] = [q["id"] for q in questions if a["id"] in q["blauwdruk"]]

    for ind in indicators:
        ind.pop("_vraagTitle", None)
        if not ind["bronUrl"] and ind["geschiktheid"] in ("goed", "gewenst"):
            warn(f"{ind['id']}: no source link ({ind['name']})")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    generated = dt.date.today().isoformat()
    OUT.write_text(
        f"""// ============================================================
// AUTO-GENERATED — do not edit.
//
// Generated by scripts/extract-register.py on {generated} from
//   {excel_path.name}
//   {pdf_path.name}
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
    print(f"\nIndicators: {len(indicators)}")
    print("  v0.9 (Excel):   " + ", ".join(f"{g} {before[g]}" for g in GESCHIKTHEID))
    print("  after v0.91:    " + ", ".join(f"{g} {after[g]}" for g in GESCHIKTHEID))
    print(f"  PDF rows: {len(pdf_rows)} (" + ", ".join(
        f"{g} {sum(1 for r in pdf_rows if r['geschiktheid'] == g)}" for g in ("goed", "gewenst")) + ")")
    print(f"  in register (matched to PDF): {sum(i['inRegister'] for i in indicators)}")
    for cid, name, old, new in report["changed"]:
        print(f"  changed  {cid}: {old} → {new}  ({name})")
    for r in report["unmatched"]:
        print(f"  UNMATCHED PDF {r['indeling']}: {r['indicator']}  [{r['vraag']}]")
    print(f"  domain re-assigned in v0.91: {len(report['moved'])}")
    for cid, name, old, new in report["moved"]:
        print(f"    {cid}: {old} → {new}  ({name})")
    for i in report["dropped"]:
        print(f"  not in v0.91 {i['id']} ({i['geschiktheid']}): {i['name']}")
    print(f"Monitoringsvragen: {len(questions)} (in register: {sum(q['inRegister'] for q in questions)})")
    print(f"Blauwdruk acties: {len(actions)} (with vragen: {sum(1 for a in actions if a['vraagIds'])})")
    print(f"Timeline events: {len(meta['timeline'])}")
    if warnings:
        print(f"\n{len(warnings)} warnings:")
        for w in warnings:
            print("  - " + w)
    print(f"\nWrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
