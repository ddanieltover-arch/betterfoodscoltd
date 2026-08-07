from pathlib import Path
import json
import re
from collections import defaultdict

SQL = Path(r"c:\Users\User\Desktop\betterfoodcoltd\betterfo_wp356.sql")
PRODUCTS = Path(r"c:\Users\User\Desktop\betterfoodcoltd\web\content\products.json")
OUT = Path(r"c:\Users\User\Desktop\betterfoodcoltd\wordpress-reverse-engineer\extracted")

text = SQL.read_text(encoding="utf-8", errors="replace")
products = json.loads(PRODUCTS.read_text(encoding="utf-8"))
product_ids = {p["id"] for p in products}
id_to_product = {p["id"]: p for p in products}

print("product ids", sorted(product_ids)[:5], "...", len(product_ids))

# Inspect CREATE TABLE posts
i = text.find("CREATE TABLE `wpd5_posts`")
print("\n=== CREATE posts ===")
print(text[i : i + 1800] if i >= 0 else "missing")

# Find a known product title in dump
needle = "Whole Chicken (Griller)"
k = text.find(needle)
print("\n=== title context ===", k)
if k >= 0:
    print(repr(text[max(0, k - 80) : k + 180]))

# Count yoast / rankmath / sku in whole dump
for key in (
    "_yoast_wpseo_title",
    "_yoast_wpseo_metadesc",
    "rank_math_title",
    "_sku",
    "_regular_price",
    "_elementor_data",
    "wpforms",
):
    print(f"count {key}:", text.count(f"'{key}'"))

# Parse ALL postmeta for our product IDs
meta_re = re.compile(r"\((\d+), (\d+), '((?:\\'|[^'])*)', '((?:\\'|[^'])*)'\)")
meta: dict[int, dict[str, str]] = defaultdict(dict)
all_keys: dict[str, int] = defaultdict(int)

marker = "INSERT INTO `wpd5_postmeta`"
idx = 0
rows = 0
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
        rows += 1
        pid = int(m.group(2))
        key = m.group(3).replace("\\'", "'")
        val = m.group(4).replace("\\'", "'")
        if pid in product_ids:
            all_keys[key] += 1
            # skip huge blobs except note presence
            if key == "_elementor_data":
                meta[pid][key] = f"[elementor json {len(val)} chars]"
            elif len(val) > 5000:
                meta[pid][key] = f"[{len(val)} chars]"
            else:
                meta[pid][key] = val
    idx = j + 1

print(f"\nmeta rows total matched: {rows}")
print(f"products with meta: {len(meta)}")
print("top keys:")
for k, c in sorted(all_keys.items(), key=lambda x: -x[1])[:40]:
    print(f"  {c:3d} {k}")

# Sample one product meta
sample_id = next(iter(sorted(product_ids)))
print(f"\nsample product {sample_id} {id_to_product[sample_id]['name']}:")
for k, v in sorted(meta.get(sample_id, {}).items()):
    print(f"  {k}: {v[:120]}")

# Also check term relationships for products (already have cats)
# Extract attachment alts for product thumbnails
thumb_ids = set()
for pid, m in meta.items():
    tid = m.get("_thumbnail_id")
    if tid and tid.isdigit():
        thumb_ids.add(int(tid))

print(f"\nthumbnail ids: {len(thumb_ids)}")

# Re-scan for attachment meta for those thumbs
attach_meta: dict[int, dict[str, str]] = defaultdict(dict)
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
        if pid not in thumb_ids:
            continue
        key = m.group(3).replace("\\'|[^'])*", "").replace("\\'", "'")
        # fix - use group properly
    idx = j + 1

# redo attach properly
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
        if pid not in thumb_ids:
            continue
        key = m.group(3).replace("\\'", "'")
        val = m.group(4).replace("\\'", "'")
        if key in ("_wp_attached_file", "_wp_attachment_image_alt"):
            attach_meta[pid][key] = val
    idx = j + 1

print("attachment alts found", sum(1 for a in attach_meta.values() if "_wp_attachment_image_alt" in a))

# Page IDs we care about
page_slugs = {
    2269: "home",
    610: "about-us",
    616: "contact-us",
    13: "shop",
    5492: "quote-list",
}
page_meta: dict[int, dict[str, str]] = defaultdict(dict)
interesting_page_keys = (
    "_yoast_wpseo_title",
    "_yoast_wpseo_metadesc",
    "rank_math_title",
    "rank_math_description",
    "_elementor_template_type",
    "_wp_page_template",
)
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
        if pid not in page_slugs:
            continue
        key = m.group(3).replace("\\'", "'")
        val = m.group(4).replace("\\'", "'")
        if key in interesting_page_keys or key.startswith(("_yoast", "rank_math")):
            page_meta[pid][key] = val[:500]
        if key == "_elementor_data":
            page_meta[pid]["_elementor_data_len"] = str(len(val))
    idx = j + 1

print("\n=== page meta ===")
for pid, slug in page_slugs.items():
    print(pid, slug, dict(page_meta.get(pid, {})))

# Build enriched products
enriched = []
for p in products:
    m = meta.get(p["id"], {})
    thumb = m.get("_thumbnail_id", "")
    alt = ""
    file = ""
    if thumb.isdigit():
        am = attach_meta.get(int(thumb), {})
        alt = am.get("_wp_attachment_image_alt", "")
        file = am.get("_wp_attached_file", "")

    # Prefer existing bullets; add SQL-derived structured fields
    enriched.append(
        {
            **p,
            "sku": m.get("_sku", ""),
            "stockStatus": m.get("_stock_status", "instock"),
            "weight": m.get("_weight", ""),
            "dimensions": {
                "length": m.get("_length", ""),
                "width": m.get("_width", ""),
                "height": m.get("_height", ""),
            },
            "seo": {
                "title": m.get("_yoast_wpseo_title") or m.get("rank_math_title") or "",
                "description": m.get("_yoast_wpseo_metadesc")
                or m.get("rank_math_description")
                or "",
            },
            "thumbnailId": int(thumb) if thumb.isdigit() else None,
            "thumbnailFile": file,
            "imageAlt": alt or (p["images"][0]["alt"] if p.get("images") else p["name"]),
            "totalSales": m.get("total_sales", ""),
            "sqlMetaKeys": sorted(m.keys()),
        }
    )

# Update image alts where we have better alts
for p in enriched:
    if p.get("imageAlt") and p.get("images"):
        p["images"] = [{**p["images"][0], "alt": p["imageAlt"]}]

report = {
    "productsWithMeta": len(meta),
    "metaKeyFrequency": dict(sorted(all_keys.items(), key=lambda x: -x[1])),
    "yoastTitles": sum(1 for p in enriched if p["seo"]["title"]),
    "yoastDescs": sum(1 for p in enriched if p["seo"]["description"]),
    "withSku": sum(1 for p in enriched if p["sku"]),
    "withWeight": sum(1 for p in enriched if p["weight"]),
    "pageMeta": {page_slugs[pid]: meta for pid, meta in page_meta.items()},
    "sampleProductMeta": {
        id_to_product[sample_id]["slug"]: meta.get(sample_id, {})
    },
}

(OUT / "sql-mine-report.json").write_text(
    json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
)
(OUT / "products-enriched.json").write_text(
    json.dumps(enriched, indent=2, ensure_ascii=False), encoding="utf-8"
)

# Also extract options for redirects / permalinks already known
print("\n=== SUMMARY ===")
print(json.dumps({k: report[k] for k in ("productsWithMeta", "yoastTitles", "yoastDescs", "withSku", "withWeight")}, indent=2))
print("keys:", list(report["metaKeyFrequency"].keys())[:25])
