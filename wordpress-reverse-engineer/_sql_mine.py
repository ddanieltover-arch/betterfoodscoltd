"""Mine betterfo_wp356.sql for SEO, product meta, and page content the REST API may have missed."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

SQL = Path(r"c:\Users\User\Desktop\betterfoodcoltd\betterfo_wp356.sql")
OUT = Path(r"c:\Users\User\Desktop\betterfoodcoltd\wordpress-reverse-engineer\extracted")
OUT.mkdir(parents=True, exist_ok=True)

PRODUCTS_JSON = Path(r"c:\Users\User\Desktop\betterfoodcoltd\web\content\products.json")


def extract_option(text: str, name: str) -> str | None:
    m = re.search(
        rf"\(\d+, '{re.escape(name)}', '((?:\\'|[^'])*)', '(?:on|off|auto|yes|no)'\)",
        text,
    )
    return m.group(1) if m else None


def php_strings(serialized: str) -> list[str]:
    return re.findall(r's:\d+:"((?:\\.|[^"\\])*)"', serialized)


def main() -> None:
    print("Loading SQL...")
    text = SQL.read_text(encoding="utf-8", errors="replace")

    # ---- posts: id -> title, slug, type, status, excerpt ----
    # Match end-of-row type pattern and walk title/status/slug separately
    marker = "INSERT INTO `wpd5_posts`"
    chunks: list[str] = []
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
        chunks.append(text[i : j + 2])
        idx = j + 1

    # Row: (ID, author, date, date_gmt, content, title, excerpt, status, ..., name, ..., type, mime, count)
    row_re = re.compile(
        r"\((\d+), (\d+), "
        r"'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', "
        r"'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', "
        r"'((?:\\'|[^'])*)', "  # content
        r"'((?:\\'|[^'])*)', "  # title
        r"'((?:\\'|[^'])*)', "  # excerpt
        r"'([a-z0-9_-]+)', "  # status
        r"'([^']*)', '([^']*)', '((?:\\'|[^'])*)', "  # comment/ping/password
        r"'((?:\\'|[^'])*)', "  # post_name
    )

    type_end_re = re.compile(
        r"'([a-z0-9_-]{1,40})','([^']{0,100})',(\d+)\)([,;])"
    )

    posts: dict[int, dict] = {}
    for chunk in chunks:
        # Pair starts with ID... with type endings by scanning sequentially is hard for large content.
        # Use a simpler approach: for each type ending, find preceding post_name and title via limited window.
        for m in type_end_re.finditer(chunk):
            post_type = m.group(1)
            if post_type not in (
                "page",
                "post",
                "product",
                "elementor_library",
                "wpforms",
                "attachment",
            ):
                continue
            end = m.start()
            window = chunk[max(0, end - 8000) : end]
            # Find last title/status/slug before type
            # Look for ,'status','...','...','...','slug' near the end of window
            sm = re.search(
                r"'((?:\\'|[^'])*)',"  # title - but may be too greedy; use from known statuses
                r"'((?:\\'|[^'])*)',"
                r"'(publish|draft|private|pending|inherit)',"
                r"'([^']*)','([^']*)','((?:\\'|[^'])*)',"
                r"'((?:\\'|[^'])*)',"  # slug
                r"'((?:\\'|[^'])*)','((?:\\'|[^'])*)',"
                r"'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})','(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})',"
                r"'((?:\\'|[^'])*)',(\d+),'((?:\\'|[^'])*)',(\d+)$",
                window,
            )
            if not sm:
                continue
            # Need ID - search backwards for (ID, author, date
            id_m = None
            for id_match in re.finditer(
                r"\((\d+), (\d+), '\d{4}-\d{2}-\d{2}", window
            ):
                id_m = id_match
            if not id_m:
                continue
            pid = int(id_m.group(1))
            title = sm.group(1).replace("\\'", "'")
            excerpt = sm.group(2).replace("\\'", "'")
            status = sm.group(3)
            slug = sm.group(7).replace("\\'", "'")
            posts[pid] = {
                "id": pid,
                "title": title,
                "excerpt": excerpt,
                "status": status,
                "slug": slug,
                "type": post_type,
            }

    print(f"Parsed posts: {len(posts)}")
    by_type: dict[str, int] = defaultdict(int)
    for p in posts.values():
        by_type[p["type"]] += 1
    print("By type:", dict(by_type))

    # ---- postmeta for products / SEO ----
    meta_keys_wanted = {
        "_yoast_wpseo_title",
        "_yoast_wpseo_metadesc",
        "_yoast_wpseo_canonical",
        "_yoast_wpseo_focuskw",
        "rank_math_title",
        "rank_math_description",
        "rank_math_focus_keyword",
        "_sku",
        "_regular_price",
        "_sale_price",
        "_price",
        "_weight",
        "_length",
        "_width",
        "_height",
        "_stock_status",
        "_stock",
        "_product_attributes",
        "_thumbnail_id",
        "_product_image_gallery",
        "_elementor_edit_mode",
        "_elementor_template_type",
        "_wp_attached_file",
        "_wp_attachment_image_alt",
    }

    print("Scanning postmeta...")
    meta: dict[int, dict[str, str]] = defaultdict(dict)
    # Also collect all unique meta keys for products to discover custom fields
    product_ids = {pid for pid, p in posts.items() if p["type"] == "product"}
    page_ids = {pid for pid, p in posts.items() if p["type"] == "page"}

    meta_re = re.compile(
        r"\((\d+), (\d+), '((?:\\'|[^'])*)', '((?:\\'|[^'])*)'\)"
    )
    meta_marker = "INSERT INTO `wpd5_postmeta`"
    midx = 0
    scanned = 0
    while True:
        i = text.find(meta_marker, midx)
        if i < 0:
            break
        j = text.find(");\n", i)
        if j < 0:
            j = text.find(");\r\n", i)
        if j < 0:
            j = len(text)
        chunk = text[i : j + 2]
        for m in meta_re.finditer(chunk):
            scanned += 1
            post_id = int(m.group(2))
            key = m.group(3).replace("\\'", "'")
            val = m.group(4).replace("\\'", "'")
            if post_id in product_ids or post_id in page_ids:
                if key in meta_keys_wanted or key.startswith(
                    ("_yoast", "rank_math", "attribute_", "tbay_")
                ):
                    meta[post_id][key] = val
                # Capture short custom fields (not huge Elementor data)
                if (
                    post_id in product_ids
                    and not key.startswith("_")
                    and len(val) < 500
                    and key
                    not in (
                        "total_sales",
                    )
                ):
                    meta[post_id][key] = val
            # attachment alt/file for later
            if key in ("_wp_attached_file", "_wp_attachment_image_alt"):
                meta[post_id][key] = val
        midx = j + 1

    print(f"Meta rows scanned ~{scanned}, posts with meta: {len(meta)}")

    # ---- Enrich products from existing JSON ----
    products = json.loads(PRODUCTS_JSON.read_text(encoding="utf-8"))
    by_slug = {p["slug"]: p for p in products}
    by_id = {p["id"]: p for p in products}

    # Map SQL products by slug
    sql_products = [p for p in posts.values() if p["type"] == "product" and p["status"] == "publish"]
    print(f"SQL published products: {len(sql_products)}")

    enriched = []
    seo_found = 0
    sku_found = 0
    for p in products:
        pid = p["id"]
        m = meta.get(pid, {})
        seo_title = (
            m.get("_yoast_wpseo_title")
            or m.get("rank_math_title")
            or ""
        )
        seo_desc = (
            m.get("_yoast_wpseo_metadesc")
            or m.get("rank_math_description")
            or ""
        )
        if seo_title or seo_desc:
            seo_found += 1
        sku = m.get("_sku") or ""
        if sku:
            sku_found += 1

        # Strip HTML from excerpt if SQL has better short text
        sql_post = posts.get(pid)
        sql_excerpt = ""
        if sql_post and sql_post.get("excerpt"):
            sql_excerpt = re.sub(r"<[^>]+>", " ", sql_post["excerpt"])
            sql_excerpt = re.sub(r"\s+", " ", sql_excerpt).strip()

        extras = {
            k: v
            for k, v in m.items()
            if not k.startswith(("_", "attribute_"))
            and k
            not in (
                "total_sales",
            )
            and len(v) < 300
        }

        enriched.append(
            {
                **p,
                "sku": sku or p.get("sku") or "",
                "seo": {
                    "title": seo_title.replace("%%title%%", p["name"])
                    .replace("%%sitename%%", "BETTER FOODS CO., LTD")
                    .replace("%%sep%%", "|")
                    .strip(" |"),
                    "description": seo_desc,
                },
                "stockStatus": m.get("_stock_status") or "instock",
                "weight": m.get("_weight") or "",
                "dimensions": {
                    "length": m.get("_length") or "",
                    "width": m.get("_width") or "",
                    "height": m.get("_height") or "",
                },
                "sqlExcerpt": sql_excerpt,
                "customFields": extras,
            }
        )

    # Pages from SQL
    pages_out = []
    for p in posts.values():
        if p["type"] != "page" or p["status"] != "publish":
            continue
        m = meta.get(p["id"], {})
        pages_out.append(
            {
                **p,
                "seo": {
                    "title": m.get("_yoast_wpseo_title")
                    or m.get("rank_math_title")
                    or "",
                    "description": m.get("_yoast_wpseo_metadesc")
                    or m.get("rank_math_description")
                    or "",
                },
                "elementor": m.get("_elementor_edit_mode") == "builder",
                "templateType": m.get("_elementor_template_type") or "",
            }
        )

    # Discover product meta key frequency
    key_freq: dict[str, int] = defaultdict(int)
    for pid in product_ids:
        for k in meta.get(pid, {}):
            key_freq[k] += 1

    report = {
        "postsParsed": len(posts),
        "byType": dict(by_type),
        "sqlPublishedProducts": len(sql_products),
        "jsonProducts": len(products),
        "productsWithSeo": seo_found,
        "productsWithSku": sku_found,
        "productMetaKeys": dict(sorted(key_freq.items(), key=lambda x: -x[1])[:60]),
        "publishedPages": [
            {"id": p["id"], "slug": p["slug"], "title": p["title"]}
            for p in pages_out
        ],
        "site": {
            "blogname": extract_option(text, "blogname"),
            "admin_email": extract_option(text, "admin_email"),
            "woocommerce_email_from_address": extract_option(
                text, "woocommerce_email_from_address"
            ),
        },
    }

    (OUT / "sql-mine-report.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (OUT / "products-enriched.json").write_text(
        json.dumps(enriched, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (OUT / "pages-from-sql.json").write_text(
        json.dumps(pages_out, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print(json.dumps(report, indent=2)[:4000])
    print(f"\nWrote to {OUT}")


if __name__ == "__main__":
    main()
