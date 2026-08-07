"""Phase 1 forensic extraction from WordPress SQL dump."""
from __future__ import annotations

import re
from collections import Counter, defaultdict
from pathlib import Path

SQL = Path(r"c:\Users\User\Desktop\betterfoodcoltd\betterfo_wp356.sql")
OUT = Path(r"c:\Users\User\Desktop\betterfoodcoltd\wordpress-reverse-engineer\_audit_raw.txt")


def php_unserialize_strings(serialized: str) -> list[str]:
    return re.findall(r's:\d+:"([^"]*)"', serialized)


def extract_option(text: str, name: str) -> str | None:
    m = re.search(
        rf"\(\d+, '{re.escape(name)}', '((?:\\'|[^'])*)', '(?:on|off|auto|yes|no)'\)",
        text,
    )
    return m.group(1) if m else None


def main() -> None:
    print("Loading SQL (may take a moment)...")
    text = SQL.read_text(encoding="utf-8", errors="replace")
    lines_out: list[str] = []

    def log(s: str = "") -> None:
        lines_out.append(s)
        print(s)

    log("=== SITE IDENTITY ===")
    for key in (
        "siteurl",
        "home",
        "blogname",
        "blogdescription",
        "admin_email",
        "template",
        "stylesheet",
        "permalink_structure",
        "show_on_front",
        "page_on_front",
        "page_for_posts",
        "woocommerce_currency",
        "woocommerce_default_country",
        "woocommerce_store_address",
        "woocommerce_store_city",
        "woocommerce_store_postcode",
        "woocommerce_email_from_address",
        "woocommerce_email_from_name",
        "date_format",
        "timezone_string",
        "WPLANG",
        "users_can_register",
    ):
        val = extract_option(text, key)
        if val is not None:
            log(f"  {key}: {val[:200]}")

    log("\n=== ACTIVE PLUGINS ===")
    ap = extract_option(text, "active_plugins")
    if ap:
        # Unescape PHP-serialized slashes in dump
        raw = ap.replace("\\'", "'").replace('\\"', '"')
        for p in php_unserialize_strings(raw):
            if p.endswith(".php"):
                log(f"  - {p}")

    # Parse posts table inserts: find all INSERT INTO `wpd5_posts`
    log("\n=== PARSING POSTS ===")
    type_counts: Counter[str] = Counter()
    status_by_type: dict[str, Counter[str]] = defaultdict(Counter)
    published: list[tuple[str, str, str, str]] = []  # type, status, title, slug
    # Row ends: ...,'post_type','mime_type',comment_count)
    row_end = re.compile(
        r",'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})','(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})',"
        r"'((?:\\'|[^'])*)','((?:\\\\'|[^'])*)','((?:\\'|[^'])*)',"
        r"'((?:\\'|[^'])*)','((?:\\'|[^'])*)','((?:\\'|[^'])*)',"
        r"'((?:\\'|[^'])*)','((?:\\'|[^'])*)','((?:\\'|[^'])*)',"
        r"'((?:\\'|[^'])*)','((?:\\'|[^'])*)',(\d+),"
        r"'((?:\\'|[^'])*)','((?:\\'|[^'])*)',(\d+)\)"
    )
    # Simpler end-anchored: post_name ... post_type
    # Typical: 'post_name','to_ping','pinged','modified','modified_gmt','content_filtered',parent,'guid',menu_order,'type','mime',count)
    simple_end = re.compile(
        r"'((?:\\'|[^'])*)','((?:\\'|[^'])*)','((?:\\'|[^'])*)',"
        r"'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})','(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})',"
        r"'((?:\\'|[^'])*)',(\d+),'((?:\\'|[^'])*)',(\d+),"
        r"'([a-z0-9_-]+)','((?:\\'|[^'])*)',(\d+)\)"
    )

    # Also capture title: after content comes title. Hard because content is huge.
    # Alternative: extract ID + title via: (ID, author, date, date_gmt, content, title
    # For inventory we mainly need title/slug/type/status.

    title_slug_type = re.compile(
        r"\((\d+), (\d+), '(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', "
        r"'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', "
        r"'(?:\\'|[^'])*', "  # content
        r"'((?:\\'|[^'])*)', "  # title
        r"'((?:\\'|[^'])*)', "  # excerpt
        r"'([a-z0-9_-]+)', "  # status
    )

    # Combined: find title then later find type for same row is hard.
    # Use simple_end for type counts, and a separate pass for pages/products.

    insert_chunks = []
    marker = "INSERT INTO `wpd5_posts`"
    idx = 0
    while True:
        i = text.find(marker, idx)
        if i < 0:
            break
        # find end at );\n or );\r
        j = text.find(");\n", i)
        if j < 0:
            j = text.find(");\r\n", i)
        if j < 0:
            j = len(text)
        insert_chunks.append(text[i:j])
        idx = j + 1

    log(f"  Found {len(insert_chunks)} posts INSERT chunks")

    for chunk in insert_chunks:
        for m in simple_end.finditer(chunk):
            post_name = m.group(1).replace("\\'", "'")
            post_type = m.group(10)
            mime = m.group(11)
            type_counts[post_type] += 1

    log("\n=== POST TYPE COUNTS ===")
    for t, c in type_counts.most_common():
        log(f"  {t}: {c}")

    # Extract published pages and products with title + slug
    # Pattern: title, excerpt, status, comment_status, ping_status, password, post_name, ... type
    item_re = re.compile(
        r"'((?:\\'|[^'])*)',"  # title
        r"'((?:\\'|[^'])*)',"  # excerpt
        r"'(publish|draft|private|pending)',"
        r"'([^']*)','([^']*)','((?:\\'|[^'])*)',"
        r"'((?:\\'|[^'])*)',"  # post_name
        r"'((?:\\'|[^'])*)','((?:\\'|[^'])*)',"
        r"'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})','(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})',"
        r"'((?:\\'|[^'])*)',(\d+),'((?:\\'|[^'])*)',(\d+),"
        r"'(page|post|product|elementor_library|tbay_footer|tbay_megamenu|tbay_header|tbay_customtab|wpforms|product_variation)',"
    )

    by_type: dict[str, list[tuple[str, str, str]]] = defaultdict(list)
    for chunk in insert_chunks:
        for m in item_re.finditer(chunk):
            title = m.group(1).replace("\\'", "'")
            status = m.group(3)
            slug = m.group(7).replace("\\'", "'")
            ptype = m.group(16)
            by_type[ptype].append((status, title, slug))
            status_by_type[ptype][status] += 1

    for ptype in sorted(by_type.keys()):
        log(f"\n=== {ptype.upper()} ({len(by_type[ptype])}) ===")
        for status, title, slug in sorted(by_type[ptype], key=lambda x: x[1].lower()):
            log(f"  [{status}] {title}  → /{slug}/")

    # Product categories from terms
    log("\n=== PRODUCT CATEGORIES / TERMS ===")
    # wpd5_terms + term_taxonomy
    terms = {}
    for m in re.finditer(
        r"\((\d+), '((?:\\'|[^'])*)', '((?:\\'|[^'])*)', (\d+)\)",
        text[text.find("INSERT INTO `wpd5_terms`") : text.find("INSERT INTO `wpd5_terms`") + 500000]
        if "INSERT INTO `wpd5_terms`" in text
        else "",
    ):
        terms[m.group(1)] = (m.group(2).replace("\\'", "'"), m.group(3))

    tax_start = text.find("INSERT INTO `wpd5_term_taxonomy`")
    if tax_start > 0:
        tax_chunk = text[tax_start : tax_start + 800000]
        for m in re.finditer(
            r"\((\d+), (\d+), '([a-z0-9_-]+)', '((?:\\'|[^'])*)', (\d+), (\d+)\)",
            tax_chunk,
        ):
            tax_id, term_id, taxonomy, _desc, parent, count = m.groups()
            if taxonomy in (
                "product_cat",
                "product_tag",
                "category",
                "nav_menu",
                "product_brand",
            ):
                name, slug = terms.get(term_id, ("?", "?"))
                log(f"  [{taxonomy}] {name} (slug={slug}, count={count}, parent={parent})")

    # Menus
    log("\n=== NAV MENUS (from terms) ===")
    # Already logged nav_menu above

    # WooCommerce pages
    log("\n=== WOOCOMMERCE PAGE IDS ===")
    for key in (
        "woocommerce_shop_page_id",
        "woocommerce_cart_page_id",
        "woocommerce_checkout_page_id",
        "woocommerce_myaccount_page_id",
        "woocommerce_terms_page_id",
        "wpforms_license",
    ):
        val = extract_option(text, key)
        if val:
            log(f"  {key}: {val}")

    # Theme options snippet - colors/logo
    log("\n=== THEME OPTIONS KEYS (greenmart) ===")
    to = extract_option(text, "greenmart_tbay_theme_options")
    if to:
        keys = re.findall(r's:(\d+):"([^"]+)"', to[:50000])
        interesting = [
            k
            for _, k in keys
            if any(
                x in k.lower()
                for x in (
                    "logo",
                    "color",
                    "font",
                    "header",
                    "footer",
                    "email",
                    "phone",
                    "address",
                    "social",
                    "favicon",
                    "copyright",
                    "main-font",
                    "primary",
                )
            )
        ]
        for k in interesting[:80]:
            log(f"  key: {k}")
        # Extract logo urls
        for m in re.finditer(r's:3:"url";s:\d+:"(https?://[^"]+)"', to):
            log(f"  asset url: {m.group(1)}")

    OUT.write_text("\n".join(lines_out), encoding="utf-8")
    log(f"\nWrote {OUT}")


if __name__ == "__main__":
    main()
