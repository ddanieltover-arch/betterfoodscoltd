"""Improved post inventory extraction from WP SQL dump."""
from __future__ import annotations

import re
from collections import Counter, defaultdict
from pathlib import Path

SQL = Path(r"c:\Users\User\Desktop\betterfoodcoltd\betterfo_wp356.sql")
OUT = Path(r"c:\Users\User\Desktop\betterfoodcoltd\wordpress-reverse-engineer\_content_inventory.txt")


def main() -> None:
    print("Loading...")
    text = SQL.read_text(encoding="utf-8", errors="replace")

    # Split posts inserts
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
    print(f"chunks: {len(chunks)}")

    # End of each VALUES row: ,'post_type','mime_type',comment_count)
    end_re = re.compile(
        r",'([a-z0-9_-]{1,40})','([^']{0,100})',(\d+)\)([,;])"
    )
    type_counts: Counter[str] = Counter()
    for chunk in chunks:
        for m in end_re.finditer(chunk):
            type_counts[m.group(1)] += 1
    print("TYPE COUNTS:")
    for t, c in type_counts.most_common():
        print(f"  {t}: {c}")

    # Extract title, status, slug, type by walking from known type endings backward is hard.
    # Instead: match title/status/slug then type with a more permissive mid-section.
    # Fields after title: excerpt, status, comment_status, ping_status, password, name, to_ping, pinged, mod, mod_gmt, filtered, parent, guid, menu_order, type
    item_re = re.compile(
        r"'((?:\\'|[^'])*)',"  # 1 title
        r"'((?:\\'|[^'])*)',"  # 2 excerpt
        r"'(publish|draft|private|pending|inherit|trash|auto-draft|future)',"  # 3 status
        r"'([^']*)',"  # 4 comment_status
        r"'([^']*)',"  # 5 ping_status
        r"'((?:\\'|[^'])*)',"  # 6 password
        r"'((?:\\'|[^'])*)',"  # 7 post_name
        r"'((?:\\'|[^'])*)',"  # 8 to_ping
        r"'((?:\\'|[^'])*)',"  # 9 pinged
        r"'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})',"  # 10 modified
        r"'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})',"  # 11 modified_gmt
        r"'((?:\\'|[^'])*)',"  # 12 content_filtered
        r"(\d+),"  # 13 parent
        r"'((?:\\'|[^'])*)',"  # 14 guid
        r"(\d+),"  # 15 menu_order
        r"'([a-z0-9_-]+)',"  # 16 post_type
    )

    by_type: dict[str, list[tuple[str, str, str, str]]] = defaultdict(list)
    for chunk in chunks:
        for m in item_re.finditer(chunk):
            title = m.group(1).replace("\\'", "'")
            status = m.group(3)
            slug = m.group(7).replace("\\'", "'")
            ptype = m.group(16)
            guid = m.group(14)
            by_type[ptype].append((status, title, slug, guid))

    lines: list[str] = []
    lines.append(f"TYPE COUNTS: {dict(type_counts)}")
    for ptype in (
        "page",
        "post",
        "product",
        "product_variation",
        "elementor_library",
        "wpforms",
        "nav_menu_item",
        "tbay_footer",
        "tbay_header",
        "tbay_megamenu",
        "tbay_customtab",
        "shop_order",
        "shop_coupon",
    ):
        items = by_type.get(ptype, [])
        lines.append(f"\n=== {ptype} ({len(items)}) ===")
        # Prefer publish
        for status, title, slug, guid in sorted(items, key=lambda x: (x[0] != "publish", x[1].lower())):
            if ptype == "nav_menu_item" and status != "publish":
                continue
            lines.append(f"  [{status}] {title} | slug={slug}")

    # Also dump any other types found
    for ptype, items in sorted(by_type.items()):
        if ptype in (
            "page",
            "post",
            "product",
            "product_variation",
            "elementor_library",
            "wpforms",
            "nav_menu_item",
            "attachment",
            "revision",
            "customize_changeset",
            "oembed_cache",
            "user_request",
            "wp_global_styles",
            "wp_navigation",
            "wp_template",
            "wp_template_part",
            "wp_font_family",
            "wp_font_face",
        ):
            continue
        lines.append(f"\n=== OTHER: {ptype} ({len(items)}) ===")
        for status, title, slug, guid in items[:50]:
            lines.append(f"  [{status}] {title} | slug={slug}")

    # Menu item titles from postmeta _menu_item_url / titles already in posts
    # Product cats already known

    # Extract menu item object links from postmeta
    lines.append("\n=== MENU ITEM META (urls / object ids) ===")
    meta_marker = "INSERT INTO `wpd5_postmeta`"
    # Search for _menu_item_url and _menu_item_object_id near nav items - sample
    for key in ("_menu_item_url", "_menu_item_object", "_menu_item_object_id", "_menu_item_type"):
        count = text.count(f"'{key}'")
        lines.append(f"  {key} count: {count}")

    # WPForms forms
    lines.append("\n=== WPFORMS ===")
    forms = by_type.get("wpforms", [])
    for status, title, slug, guid in forms:
        lines.append(f"  [{status}] {title}")

    # Sample product prices from postmeta
    lines.append("\n=== SAMPLE _price / _regular_price ===")
    for m in re.finditer(r"\((\d+), (\d+), '(_(?:regular_)?price)', '([^']*)'\)", text):
        if m.group(4) and m.group(4) not in ("", "0"):
            lines.append(f"  post={m.group(2)} {m.group(3)}={m.group(4)}")
            if len([l for l in lines if "post=" in l]) > 30:
                break

    # Quote button / catalog mode hints
    lines.append("\n=== CATALOG / QUOTE OPTIONS ===")
    for key in (
        "woocommerce_cart_redirect_after_add",
        "woocommerce_enable_guest_checkout",
        "yith_gaqb_button_label",
    ):
        m = re.search(rf"'{key}', '((?:\\'|[^'])*)'", text)
        if m:
            lines.append(f"  {key}: {m.group(1)[:100]}")

    # Search get-a-quote related options
    for m in re.finditer(r"\((\d+), '((?:yith|gaqb|quote|catalog)[^']*)', '((?:\\'|[^']{0,80})*)'", text, re.I):
        lines.append(f"  option {m.group(2)}: {m.group(3)[:80]}")
        if sum(1 for l in lines if l.startswith("  option ")) > 40:
            break

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(OUT.read_text(encoding="utf-8")[:12000])
    print(f"\n... wrote {OUT}")


if __name__ == "__main__":
    main()
