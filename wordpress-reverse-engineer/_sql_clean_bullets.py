"""Clean SQL-enriched product bullets — drop related-product / review noise."""
from __future__ import annotations

import json
import re
from pathlib import Path

PATH = Path(r"c:\Users\User\Desktop\betterfoodcoltd\web\content\products.json")
EXTRACTED = Path(
    r"c:\Users\User\Desktop\betterfoodcoltd\wordpress-reverse-engineer\extracted\products-from-sql.json"
)


def is_good_bullet(text: str, product_name: str) -> bool:
    t = text.strip()
    if not t or len(t) < 3 or len(t) > 120:
        return False
    if re.search(
        r"read more|reviews?\s*\(|cancel reply|your email|related products|category:",
        t,
        re.I,
    ):
        return False
    # Keep feature-like bullets
    if re.search(
        r"halal|organic|fresh|chemical|100%|iso|certified|wholesale|export",
        t,
        re.I,
    ):
        return True
    # Keep short product-name style first bullet
    if product_name.lower() in t.lower() and len(t) < 80:
        return True
    if t.startswith("100%"):
        return True
    return False


def clean_description(desc: str, bullets: list[str]) -> str:
    d = re.sub(r"\s+", " ", desc or "").strip()
    # If description is just bullets concatenated, synthesize a wholesale line
    if not d or all(b.lower() in d.lower() for b in bullets[:3]) and "wholesale" not in d.lower():
        return ""
    # Trim review/UI tails
    d = re.split(r"\bReviews?\b|\bRelated products\b|\bBe the first to review\b", d, maxsplit=1)[
        0
    ].strip()
    return d


products = json.loads(PATH.read_text(encoding="utf-8"))
cleaned = []
for p in products:
    bullets = [b for b in (p.get("bullets") or []) if is_good_bullet(b, p["name"])]
    # Deduplicate
    seen = set()
    uniq = []
    for b in bullets:
        key = b.lower()
        if key not in seen:
            seen.add(key)
            uniq.append(b)
    bullets = uniq[:6]

    desc = clean_description(p.get("description") or "", bullets)
    if not desc and bullets:
        # Build a clean wholesale sentence from name
        desc = (
            f"We are wholesale suppliers and bulk exporters of {p['name']}. "
            f"Request a quote for availability, pack size, and cold-chain delivery."
        )

    flags = {
        "halal": any(re.search(r"\bhalal\b", b, re.I) for b in bullets),
        "organic": any(re.search(r"\borganic\b", b, re.I) for b in bullets),
        "freshNoChemicals": any(re.search(r"chemical", b, re.I) for b in bullets),
    }

    cleaned.append({**p, "bullets": bullets, "description": desc, "flags": flags})

PATH.write_text(json.dumps(cleaned, indent=2, ensure_ascii=False), encoding="utf-8")
EXTRACTED.write_text(json.dumps(cleaned, indent=2, ensure_ascii=False), encoding="utf-8")

print(
    json.dumps(
        {
            "count": len(cleaned),
            "avgBullets": round(sum(len(p["bullets"]) for p in cleaned) / len(cleaned), 2),
            "halal": sum(1 for p in cleaned if p["flags"]["halal"]),
            "organic": sum(1 for p in cleaned if p["flags"]["organic"]),
            "sample": {
                "name": cleaned[0]["name"],
                "bullets": cleaned[0]["bullets"],
                "description": cleaned[0]["description"][:200],
            },
        },
        indent=2,
    )
)
