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
  code (A01 ...) onto the Excel records. Its Gewenst indicators are in the
  register.
* Excel "Uitdraai 0.94 DMI indicatorenregister" — newest printout of every
  indicator assessed 'Goed', with full metadata (meetmethode, norm, dekking,
  type data, model/meting, beheerder ...). It decides the Goed part of the
  register: it overrides the metadata of matched records and adds new
  indicators.

Only the register is exported: the v0.94 Goed rows plus the v0.91 Gewenst
indicators. Beperkt, Niet and Goed indicators missing from v0.94 are left out,
and so are monitoringsvragen without any register indicator. (The site labels
'Goed' as 'Geschikt'; the data keeps the source value "goed".)

The older sources still supply the assessment text, the Blauwdruk G40 links,
the monitoringsvragen and the history: every overlay records what it changed
in the indicator's `changes` list.

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
    import fnmatch

    matches = sorted(
        p
        for p in DOCS.iterdir()
        if not p.name.startswith("~$")  # Office lock file of a document that is open
        and fnmatch.fnmatch(p.name.lower(), pattern.lower())
    )
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


def link_cell(cell) -> tuple[str | None, str | None]:
    """(url, label) of a cell holding a hyperlink and/or a pasted URL.

    openpyxl drops the #fragment of hyperlink targets (CBS/RIVM statline
    deep links live there), so a URL typed in the cell text wins when it
    extends the hyperlink target.
    """
    text = clean(cell.value)
    target = cell.hyperlink.target if cell.hyperlink and cell.hyperlink.target else None
    embedded = re.search(r"https?://\S+", text or "")
    url = target
    if embedded:
        typed = embedded.group(0).rstrip(").,;")
        if not url or typed.startswith(url.split("#")[0].rstrip("/")):
            url = typed
    label = text
    if label and embedded:
        label = clean(label.replace(embedded.group(0), "")) or re.sub(
            r"^https?://(www\.)?([^/]+).*$", r"\2", embedded.group(0)
        )
    return url, label


def change(ind: dict, version: str, field: str, old, new) -> None:
    ind["changes"].append({"version": version, "field": field, "from": old, "to": new})


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

        bron_url, bron_label = link_cell(row[header["IND_Brondata"]])

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
                "inRegister": False,
                "changes": [],
                "toelichting": clean(col(row, "Toelichting geschiktheid")),
                "benodigdVoorGoed": clean(col(row, "Benodigd voor 'Goed'")),
                "vraagId": clean(col(row, "Monitoringsvraag_ID")),
                "_vraagTitle": clean(col(row, "Monitoringsvraag")),
                "domain": dom,
                "domain2": domain_code(col(row, "DMI-domein 2_optioneel")),
                "cluster": clean(col(row, "Thematische cluster")),
                "blauwdruk": split_codes(col(row, "Blauwdruk G40")),
                "type": indicator_type(col(row, "Indicator_Type")),
                "bron": clean(col(row, "IND_Dashboard")),
                "bronUrl": bron_url,
                "bronLabel": bron_label,
                "bronBeschrijving": None,
                "bronBeschrijvingUrl": None,
                "beheerder": None,
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
                "modelMeting": None,
                "typeData": None,
                "dekking": None,
                "bewerkingNodig": None,
                "meetmethode": None,
                "norm": None,
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


def read_meta(wb, excel_path: Path, pdf_path: Path, latest: dict) -> dict:
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
    excel_version = clean(v("C3")) or ""
    excel_date_iso = excel_date.date().isoformat() if isinstance(excel_date, dt.datetime) else ""
    pdf_version = m.group(4) if m else ""
    return {
        "version": latest["version"],
        "versionDate": latest["date"],
        "sources": [
            {"version": excel_version, "date": excel_date_iso, "format": "xlsx",
             "title": "DMI Indicatorenregister – werkbaar concept",
             "role": "Basis: beoordeling, Blauwdruk G40-vertaling, monitoringsvragen en proces."},
            {"version": pdf_version, "date": pdf_date, "format": "pdf",
             "title": "DMI indicatorenregister concept (printout)",
             "role": "Selectie Gewenst, geschiktheid en domeinindeling."},
            {"version": latest["version"], "date": latest["date"], "format": "xlsx",
             "title": "Uitdraai indicatoren met beoordeling ‘Goed’",
             "role": "Selectie Geschikt (‘Goed’) met metadata, registercodes, meetmethode en normen."},
        ],
        "excelVersion": excel_version,
        "excelDate": excel_date_iso,
        "pdfVersion": pdf_version,
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


def overlay_pdf(indicators: list[dict], pdf_rows: list[dict], version: str) -> dict:
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
            change(best, version, "geschiktheid", best["geschiktheid"], row["geschiktheid"])
            best["geschiktheid"] = row["geschiktheid"]
        if best["domain"] != row["domain"]:
            moved.append((best["id"], best["name"], best["domain"], row["domain"]))
            change(best, version, "domain", best["domain"], row["domain"])
            best["domain"] = row["domain"]

    # Goed/Gewenst in v0.9 but absent from v0.91 → keep v0.9 assessment, flag.
    dropped = [i for i in indicators if i["geschiktheid"] in ("goed", "gewenst") and not i["inRegister"]]
    return {"unmatched": unmatched, "changed": changed, "dropped": dropped, "moved": moved}


# --------------------------------------------------------------------------- v0.94 overlay


def capitalise(text: str | None) -> str | None:
    return text[0].upper() + text[1:] if text else text


def read_latest(path: Path) -> dict:
    """Read the 'Uitdraai' printout: one sheet, title block, header row with IDs."""
    import warnings as pywarnings

    pywarnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.worksheets[0]
    rows = list(ws.iter_rows(max_col=60))
    header_row = next(i for i, r in enumerate(rows) if any(c.value == "Indicator_ID" for c in r))
    names = [clean(c.value) for c in rows[header_row]]
    header: dict[str, int] = {}
    for i, n in enumerate(names):
        if n and n not in header:  # Monitoringsvraag_ID appears twice; take the first
            header[n] = i

    title = " ".join(clean(c.value) or "" for r in rows[:header_row] for c in r if isinstance(c.value, str))
    m = re.search(r"[Vv]ersie\s+(\d+\.\d+)\s*-\s*(\d{1,2})-(\d{1,2})-(\d{4})", title)
    version = m.group(1) if m else (re.search(r"(\d+\.\d+)", path.name) or [None, ""])[1]
    date = f"{m.group(4)}-{int(m.group(3)):02d}-{int(m.group(2)):02d}" if m else ""
    stated = {}
    for r in rows[:header_row]:
        label = next((clean(c.value) for c in r if isinstance(c.value, str)), None)
        number = next((c.value for c in r if isinstance(c.value, (int, float))), None)
        if label and number is not None:
            stated[label] = int(number)

    def cell(row, name):
        return row[header[name]] if name in header else None

    def val(row, name):
        c = cell(row, name)
        return clean(c.value) if c is not None else None

    out = []
    for row in rows[header_row + 1 :]:
        ind_id = val(row, "Indicator_ID")
        name = val(row, "Indicator")
        if not ind_id or not name:
            continue
        bron_url, bron_label = link_cell(cell(row, "Brondata"))
        besch_url, besch_label = link_cell(cell(row, "Bron beschrijving"))
        norm = None
        if (val(row, "Norm (Ja/Nee)") or "").lower().startswith("ja"):
            norm = {
                "waarde": val(row, "Normwaarde"),
                "jaar": year(cell(row, "Norm jaar").value),
                "bron": val(row, "Norm bron"),
            }
        hist = (val(row, "Historie") or "").lower()
        bewerking = ja_nee(cell(row, "Heeft bewerking nodig").value)
        eenheid = val(row, "Eenheid")
        out.append(
            {
                "id": ind_id,
                "name": name,
                "vraagId": val(row, "Monitoringsvraag_ID"),
                "vraagTitle": val(row, "Monitoringsvraag"),
                "indeling": val(row, "Volgorde register"),
                "bron": val(row, "Dashboard"),
                "type": indicator_type(cell(row, "Indicator type").value),
                "bronUrl": bron_url,
                "bronLabel": bron_label,
                "modelMeting": (val(row, "Model / Meting") or "").lower() or None,
                "openbaar": ja_nee(cell(row, "Openbaar toegankelijk").value),
                "vrijGebruik": ja_nee(cell(row, "Data vrij te gebruiken").value),
                "voorwaarden": None
                if (val(row, "Onder welke voorwaarden") or "").lower() in ("", "nvt", "n.v.t.")
                else capitalise(val(row, "Onder welke voorwaarden")),
                "beheerder": val(row, "Indicator beheerder"),
                "frequentie": val(row, "Frequentie"),
                "meestRecentJaar": year(cell(row, "Meest recent jaar").value),
                "typeData": val(row, "Type data"),
                "laagsteSchaal": val(row, "Laagste schaalniveau"),
                "dekking": val(row, "Dekking"),
                "historie": True if hist.startswith("ja") else False if hist.startswith("nee") else None,
                "bewerkingNodig": {"ja": True, "nee": False}.get(bewerking or ""),
                "domain": domain_code(cell(row, "DMI-domein").value),
                "domain2": domain_code(cell(row, "DMI-domein 2_optioneel").value),
                "cluster": val(row, "Thematische cluster"),
                "blauwdruk": split_codes(cell(row, "Blauwdruk G40").value),
                "bronBeschrijving": besch_label,
                "bronBeschrijvingUrl": besch_url,
                "dataverzamelaar": val(row, "Dataverzamelaar"),
                "prognose": capitalise(val(row, "Prognose")),
                "eenheid": None if (eenheid or "").lower() in ("nvt", "n.v.t.") else eenheid,
                "meetmethode": val(row, "Meetmethode"),
                "norm": norm,
            }
        )
    return {"version": version, "date": date, "stated": stated, "rows": out, "file": path.name}


# Fields the printout overrides when it has a value (empty cells keep the older value).
LATEST_FIELDS = [
    "indeling", "bron", "type", "bronUrl", "bronLabel", "modelMeting", "openbaar", "vrijGebruik",
    "voorwaarden", "beheerder", "frequentie", "meestRecentJaar", "typeData", "laagsteSchaal",
    "dekking", "historie", "bewerkingNodig", "domain2", "cluster", "blauwdruk", "bronBeschrijving",
    "bronBeschrijvingUrl", "dataverzamelaar", "prognose", "eenheid", "meetmethode", "norm",
]


def overlay_latest(indicators: list[dict], latest: dict) -> dict:
    """Overlay the v0.94 'Goed' printout onto the records.

    Returns a report whose "kept" set holds the slugs of the records that are
    in the printout, i.e. the register.

    Matching: same Indicator_ID, best name match among those (IDs are not
    unique). A record with the same ID but a different name counts as a
    rename only when no other record with that ID fits better.
    """
    version = latest["version"]
    by_id = collections.defaultdict(list)
    for ind in indicators:
        by_id[ind["id"]].append(ind)
    used: set[str] = set()
    report = collections.defaultdict(list)

    def ratio(a, b):
        return difflib.SequenceMatcher(None, norm(a), norm(b)).ratio()

    for row in latest["rows"]:
        if not row["domain"]:
            warn(f"v{version} {row['id']}: unknown domain — skipped")
            continue
        candidates = [i for i in by_id.get(row["id"], []) if i["slug"] not in used]
        # Ties (duplicate IDs with the same name) go to the record already in the register.
        best = max(
            candidates,
            key=lambda i: (round(ratio(i["name"], row["name"]), 3), i["inRegister"], i["geschiktheid"] == "goed"),
            default=None,
        )
        if best is None:
            # Not in v0.9 under this ID: a new indicator.
            n = sum(1 for i in indicators if i["id"] == row["id"])
            slug = slugify(row["id"]) + ("" if n == 0 else chr(ord("a") + n))
            best = {
                "slug": slug, "id": row["id"], "name": row["name"], "geschiktheid": "goed",
                "inRegister": False, "changes": [], "toelichting": None, "benodigdVoorGoed": None,
                "vraagId": row["vraagId"], "_vraagTitle": row["vraagTitle"], "domain": row["domain"],
                "schaalniveau": None, "historieNote": None,
                **{f: None for f in LATEST_FIELDS},
            }
            best["blauwdruk"] = []
            change(best, version, "added", None, None)
            indicators.append(best)
            by_id[row["id"]].append(best)
            report["added"].append(best)
        used.add(best["slug"])

        if norm(best["name"]) != norm(row["name"]) and best["changes"][-1:] != [
            {"version": version, "field": "added", "from": None, "to": None}
        ]:
            change(best, version, "name", best["name"], row["name"])
            report["renamed"].append((best["id"], best["name"], row["name"]))
            best["name"] = row["name"]
        if best["geschiktheid"] != "goed":
            change(best, version, "geschiktheid", best["geschiktheid"], "goed")
            report["changed"].append((best["id"], best["name"], best["geschiktheid"]))
            best["geschiktheid"] = "goed"
        if best["domain"] != row["domain"]:
            change(best, version, "domain", best["domain"], row["domain"])
            report["moved"].append((best["id"], best["name"], best["domain"], row["domain"]))
            best["domain"] = row["domain"]
        if row["vraagId"] and best["vraagId"] != row["vraagId"]:
            warn(f"{best['id']}: monitoringsvraag {best['vraagId']} → {row['vraagId']} in v{version}")
            best["vraagId"] = row["vraagId"]
        if row["vraagTitle"]:
            best["_vraagTitleLatest"] = row["vraagTitle"]
        for f in LATEST_FIELDS:
            if row[f] not in (None, [], ""):
                best[f] = row[f]
        if row["historie"] is not None:
            best["historieNote"] = None
        best["inRegister"] = True

    # Goed in the register before, but missing from the newest Goed printout.
    report["removed"] = [
        i for i in indicators if i["slug"] not in used and i["inRegister"] and i["geschiktheid"] == "goed"
    ]
    report["kept"] = used
    return report


# --------------------------------------------------------------------------- assemble


def build_questions(indicators, matrix, v83c) -> list[dict]:
    groups = collections.OrderedDict()
    for ind in indicators:
        groups.setdefault(ind["vraagId"], []).append(ind)

    out = []
    for vid, items in groups.items():
        counts = {g: sum(1 for i in items if i["geschiktheid"] == g) for g in ("goed", "gewenst")}
        domains = list(dict.fromkeys(i["domain"] for i in items))
        codes = list((matrix.get(vid) or {}).get("codes") or [])
        for i in items:
            codes += [c for c in i["blauwdruk"] if c not in codes]
        num = int(re.sub(r"\D", "", vid) or 0)
        out.append(
            {
                "id": vid,
                "slug": slugify(vid),
                "title": next((i["_vraagTitleLatest"] for i in items if i.get("_vraagTitleLatest")), None)
                or items[0]["_vraagTitle"]
                or vid,
                "kernvraag": (v83c.get(vid) or {}).get("kern") or (matrix.get(vid) or {}).get("kern"),
                "variaties": (v83c.get(vid) or {}).get("variaties"),
                "domains": domains,
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
    excel_path = find_source("*indicatorenregister*werkbaar concept*.xlsx")
    pdf_path = find_source("*indicatorenregister*.pdf")
    latest_path = find_source("*uitdraai*indicatorenregister*.xlsx")
    print(f"Excel:  {excel_path.name}\nPDF:    {pdf_path.name}\nLatest: {latest_path.name}")

    import warnings as pywarnings

    pywarnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")
    wb = openpyxl.load_workbook(excel_path, data_only=True)

    indicators = read_indicators(wb)
    actions = read_actions(wb)
    matrix = read_matrix(wb)
    v83c = read_v83c(wb)
    latest = read_latest(latest_path)
    meta = read_meta(wb, excel_path, pdf_path, latest)

    before = collections.Counter(i["geschiktheid"] for i in indicators)
    pdf_rows = read_pdf(pdf_path)
    report = overlay_pdf(indicators, pdf_rows, meta["pdfVersion"])
    in_pdf = sum(i["inRegister"] for i in indicators)
    after = collections.Counter(i["geschiktheid"] for i in indicators)
    report_latest = overlay_latest(indicators, latest)
    after_latest = collections.Counter(i["geschiktheid"] for i in indicators)
    assessed = len(indicators)
    # The register: the v0.94 Goed printout plus the v0.91 Gewenst indicators.
    indicators = [
        i for i in indicators
        if i["slug"] in report_latest["kept"] or (i["inRegister"] and i["geschiktheid"] == "gewenst")
    ]
    meta["assessedCount"] = assessed

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
        ind.pop("_vraagTitleLatest", None)
        ind.pop("inRegister", None)
        if not ind["bronUrl"]:
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
//   {latest_path.name}
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
    print(f"\nIndicators assessed: {assessed}")
    print("  v0.9 (Excel):   " + ", ".join(f"{g} {before[g]}" for g in GESCHIKTHEID))
    print("  after v0.91:    " + ", ".join(f"{g} {after[g]}" for g in GESCHIKTHEID))
    print(f"  PDF rows: {len(pdf_rows)} (" + ", ".join(
        f"{g} {sum(1 for r in pdf_rows if r['geschiktheid'] == g)}" for g in ("goed", "gewenst")) + ")")
    print(f"  matched to PDF: {in_pdf}")
    for cid, name, old, new in report["changed"]:
        print(f"  changed  {cid}: {old} → {new}  ({name})")
    for r in report["unmatched"]:
        print(f"  UNMATCHED PDF {r['indeling']}: {r['indicator']}  [{r['vraag']}]")
    print(f"  domain re-assigned in v0.91: {len(report['moved'])}")
    for cid, name, old, new in report["moved"]:
        print(f"    {cid}: {old} → {new}  ({name})")
    for i in report["dropped"]:
        print(f"  not in v0.91 {i['id']} ({i['geschiktheid']}): {i['name']}")
    v = latest["version"]
    reg_goed = indicators
    print(f"\nv{v} ({latest['date']}): {len(latest['rows'])} Goed rows")
    print("  after v" + v + ":    " + ", ".join(f"{g} {after_latest[g]}" for g in GESCHIKTHEID))
    print(f"  stated in printout: {latest['stated']}")
    print(f"  Goed in register: {len(reg_goed)} rows, {len({i['indeling'] for i in reg_goed})} register codes, "
          f"{len({i['vraagId'] for i in reg_goed})} monitoringsvragen")
    for cid, name, old in report_latest["changed"]:
        print(f"  changed  {cid}: {old} → goed  ({name})")
    for cid, old, new in report_latest["renamed"]:
        print(f"  renamed  {cid}: {old!r} → {new!r}")
    print(f"  domain re-assigned in v{v}: {len(report_latest['moved'])}")
    for i in report_latest["added"]:
        print(f"  added    {i['id']} ({i['vraagId']}): {i['name']}")
    for i in report_latest["removed"]:
        print(f"  no longer in Goed selection (dropped) {i['id']} ({i['indeling']}): {i['name']}")
    reg = collections.Counter(i["geschiktheid"] for i in indicators)
    print(f"Register (exported): {len(indicators)} indicators — goed {reg['goed']} (v{v}), "
          f"gewenst {reg['gewenst']} (v{meta['pdfVersion']})")
    print(f"Monitoringsvragen: {len(questions)}")
    print(f"Blauwdruk acties: {len(actions)} (with vragen: {sum(1 for a in actions if a['vraagIds'])})")
    print(f"Timeline events: {len(meta['timeline'])}")
    if warnings:
        print(f"\n{len(warnings)} warnings:")
        for w in warnings:
            print("  - " + w)
    print(f"\nWrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
