"""Extract product descriptions from External Importer (_ei_product) PHP objects
and plain text from Elementor page JSON stored in SQL postmeta.
"""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

SQL = Path(r"c:\Users\User\Desktop\betterfoodcoltd\betterfo_wp356.sql")
PRODUCTS = Path(r"c:\Users\User\Desktop\betterfoodcoltd\web\content\products.json")
OUT = Path(r"c:\Users\User\Desktop\betterfoodcoltd\wordpress-reverse-engineer\extracted")
WEB_PRODUCTS = Path(r"c:\Users\User\Desktop\betterfoodcoltd\web\content\products.json")
WEB_SITE = Path(r"c:\Users\User\Desktop\betterfoodcoltd\web\content\site.json")
WEB_PAGES = Path(r"c:\Users\User\Desktop\betterfoodcoltd\web\content\pages-copy.json")


def unescape_sql(s: str) -> str:
    return (
        s.replace("\\'", "'")
        .replace('\\"', '"')
        .replace("\\\\", "\\")
        .replace("\\n", "\n")
        .replace("\\r", "")
    )


def strip_html(html: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", html, flags=re.I)
    text = re.sub(r"</p>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"&lt;", "<", text)
    text = re.sub(r"&gt;", ">", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_bullets(html: str) -> list[str]:
    return [
        strip_html(b)
        for b in re.findall(r"<li>(.*?)</li>", html, flags=re.I | re.S)
        if strip_html(b)
    ]


def php_string_field(blob: str, field: str) -> str | None:
    """Pull s:N:\"value\" after a known field name in a PHP serialized object."""
    # Match: s:len:"field";s:len:"value"  OR s:len:"field";N; etc
    pat = rf's:\d+:"{re.escape(field)}";(?:s:(\d+):"|N;)'
    m = re.search(pat, blob)
    if not m:
        return None
    if m.group(0).endswith("N;"):
        return ""
    length = int(m.group(1))
    start = m.end()
    # value follows opening quote already consumed by pattern's final "
    # Actually pattern ends at opening quote of value — start is after "
    raw = blob[start : start + length]
    return raw


def main() -> None:
    print("Loading...")
    text = SQL.read_text(encoding="utf-8", errors="replace")
    products = json.loads(PRODUCTS.read_text(encoding="utf-8"))
    product_ids = {p["id"] for p in products}
    by_id = {p["id"]: p for p in products}

    meta_re = re.compile(r"\((\d+), (\d+), '((?:\\'|[^'])*)', '((?:\\'|[^'])*)'\)")

    ei_blobs: dict[int, str] = {}
    elementor: dict[int, str] = {}
    alts: dict[int, str] = {}
    thumb_of: dict[int, int] = {}

    page_ids = {2269, 610, 616}  # home, about, contact

    marker = "INSERT INTO `wpd5_postmeta`"
    idx = 0
    while True:
        i = text.find(marker, idx)
        if i < 0:
            break
        j = text.find(");\n", i)
        if j < 0:
            j = text.find(");\r\n", i)
        if j < 0:
            j = len(text)
        chunk = text[i : j + 2]
        for m in meta_re.finditer(chunk):
            pid = int(m.group(2))
            key = unescape_sql(m.group(3))
            val = unescape_sql(m.group(4))
            if pid in product_ids and key == "_ei_product":
                ei_blobs[pid] = val
            if pid in product_ids and key == "_thumbnail_id" and val.isdigit():
                thumb_of[pid] = int(val)
            if pid in page_ids and key == "_elementor_data":
                elementor[pid] = val
            if key == "_wp_attachment_image_alt" and val:
                alts[pid] = val
        idx = j + 1

    print(f"_ei_product blobs: {len(ei_blobs)}")
    print(f"elementor pages: {list(elementor)}")
    print(f"attachment alts: {len(alts)}")

    enriched = []
    improved_bullets = 0
    improved_desc = 0
    for p in products:
        pid = p["id"]
        blob = ei_blobs.get(pid, "")
        desc_html = php_string_field(blob, "description") if blob else None
        short_html = php_string_field(blob, "shortDescription") if blob else None
        category = php_string_field(blob, "category") if blob else None
        source_url = php_string_field(blob, "link") if blob else None

        bullets = list(p.get("bullets") or [])
        description = p.get("description") or ""

        if desc_html:
            extracted_bullets = extract_bullets(desc_html)
            if extracted_bullets and (
                not bullets or len(extracted_bullets) >= len(bullets)
            ):
                if extracted_bullets != bullets:
                    improved_bullets += 1
                bullets = extracted_bullets

            # Prefer clean paragraph after the list
            paras = re.findall(r"<p>(.*?)</p>", desc_html, flags=re.I | re.S)
            paras = [strip_html(x) for x in paras if strip_html(x)]
            # Filter review/UI noise
            paras = [
                x
                for x in paras
                if not re.search(
                    r"review|email address will not|required fields|cancel reply",
                    x,
                    re.I,
                )
                and len(x) > 40
            ]
            if paras:
                candidate = paras[0]
                if len(candidate) > len(description):
                    description = candidate
                    improved_desc += 1

        if short_html and not description:
            description = strip_html(short_html)
            improved_desc += 1

        thumb_id = thumb_of.get(pid)
        image_alt = alts.get(thumb_id, "") if thumb_id else ""
        images = p.get("images") or []
        if images:
            images = [
                {
                    **images[0],
                    "alt": image_alt or images[0].get("alt") or p["name"],
                }
            ]

        # Detect HALAL / organic flags from bullets
        flags = {
            "halal": any(re.search(r"\bhalal\b", b, re.I) for b in bullets),
            "organic": any(re.search(r"\borganic\b", b, re.I) for b in bullets),
            "freshNoChemicals": any(
                re.search(r"chemical", b, re.I) for b in bullets
            ),
        }

        enriched.append(
            {
                "id": p["id"],
                "name": p["name"],
                "slug": p["slug"],
                "permalink": p.get("permalink")
                or f"https://betterfoodcoltd.com/product/{p['slug']}/",
                "categories": p.get("categories") or [],
                "bullets": bullets,
                "description": description,
                "images": images,
                "price": 0,
                "currency": "THB",
                "quoteOnly": True,
                "stockStatus": "instock",
                "flags": flags,
                "source": {
                    "importerUrl": source_url or "",
                    "importerCategory": category or "",
                },
            }
        )

    # Elementor text extraction for pages
    def elementor_texts(raw: str) -> list[str]:
        # Elementor JSON stores "title", "description", "editor", "text" fields
        texts: list[str] = []
        for key in ("title", "description", "editor", "text", "html"):
            for m in re.finditer(
                rf'"{key}"\s*:\s*"((?:\\.|[^"\\])*)"', raw
            ):
                val = m.group(1)
                val = (
                    val.encode("utf-8")
                    .decode("unicode_escape", errors="ignore")
                    if "\\u" in val
                    else val
                )
                val = val.replace("\\n", "\n").replace('\\"', '"')
                clean = strip_html(val)
                if len(clean) >= 20:
                    texts.append(clean)
        # dedupe preserve order
        seen = set()
        out = []
        for t in texts:
            if t not in seen:
                seen.add(t)
                out.append(t)
        return out

    pages_copy = {}
    page_names = {2269: "home", 610: "about-us", 616: "contact-us"}
    for pid, raw in elementor.items():
        pages_copy[page_names[pid]] = {
            "id": pid,
            "texts": elementor_texts(raw)[:40],
        }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "products-from-sql.json").write_text(
        json.dumps(enriched, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (OUT / "elementor-page-copy.json").write_text(
        json.dumps(pages_copy, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # Write into web content (runtime source)
    WEB_PRODUCTS.write_text(
        json.dumps(enriched, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    WEB_PAGES.write_text(
        json.dumps(pages_copy, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # Update site.json with secondary email found in SQL
    if WEB_SITE.exists():
        site = json.loads(WEB_SITE.read_text(encoding="utf-8"))
        site["email"] = "sales@betterfoodcoltd.com"
        site["emailSales"] = "sale@betterfoodcoltd.com"
        site["sqlSource"] = "betterfo_wp356.sql"
        site["legacyImporterDomain"] = "betterfoodsthai.com"
        WEB_SITE.write_text(
            json.dumps(site, indent=2, ensure_ascii=False), encoding="utf-8"
        )

    report = {
        "products": len(enriched),
        "improvedBullets": improved_bullets,
        "improvedDescriptions": improved_desc,
        "halalCount": sum(1 for p in enriched if p["flags"]["halal"]),
        "organicCount": sum(1 for p in enriched if p["flags"]["organic"]),
        "elementorPages": {k: len(v["texts"]) for k, v in pages_copy.items()},
        "sample": {
            "slug": enriched[0]["slug"],
            "bullets": enriched[0]["bullets"],
            "description": enriched[0]["description"][:240],
            "flags": enriched[0]["flags"],
        },
    }
    (OUT / "sql-enrichment-report.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
