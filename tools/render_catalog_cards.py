"""Rebuild the public metadata-only title cards from docs/books/index.html.

The cards are original Pillow rectangles and raster text. They are catalog
substitutes, not Amazon covers. Run without arguments to verify the committed
WebP files; pass --write to regenerate those files only.
"""

from __future__ import annotations

import argparse
from html import unescape
from io import BytesIO
import os
from pathlib import Path
import re

from PIL import Image, ImageDraw, ImageFont


BOOKS = Path(__file__).resolve().parents[1] / "docs" / "books"
PALETTE = {
    "engineering": ("#111c22", "#d7ff42"),
    "business": ("#1d2635", "#ecbd81"),
    "media": ("#241d2c", "#e9a8d2"),
    "niche": ("#25302b", "#b7dfc0"),
}
LABELS = {
    "engineering": "Engineering & Architecture",
    "business": "Operations & Business",
    "media": "Media & Content",
    "niche": "Professional & Niche",
}


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    windows_dir = os.environ.get("WINDIR")
    if not windows_dir:
        raise RuntimeError("Windows with installed Segoe UI fonts is required")
    return ImageFont.truetype(str(Path(windows_dir) / "Fonts" / name), size)


def card_metadata():
    html = (BOOKS / "index.html").read_text(encoding="utf-8")
    articles = re.findall(r'<article class="book-card".*?</article>', html, re.S)
    if len(articles) != 19:
        raise ValueError(f"Expected 19 public book cards, found {len(articles)}")
    seen = set()
    for article in articles:
        attrs = article.split(">", 1)[0]
        book_id = re.search(r'data-id="([A-Za-z0-9-]+)"', attrs)
        category = re.search(r'data-category="([a-z]+)"', attrs)
        if not book_id or not category or category.group(1) not in PALETTE:
            raise ValueError("Book card has missing or unknown metadata")
        ident = book_id.group(1)
        if ident in seen:
            raise ValueError(f"Duplicate book ID: {ident}")
        seen.add(ident)

        def field(css_class: str) -> str:
            match = re.search(
                rf'<(?:h3|p) class="{css_class}"[^>]*>(.*?)</(?:h3|p)>',
                article,
                re.S,
            )
            if not match:
                raise ValueError(f"Missing {css_class} for {ident}")
            return unescape(re.sub(r"<[^>]+>", "", match.group(1))).strip()

        author = field("book-byline")
        if not author.startswith("by "):
            raise ValueError(f"Missing author byline for {ident}")
        yield {
            "id": ident,
            "category": category.group(1),
            "title": field("book-title"),
            "subtitle": field("book-subtitle"),
            "author": author,
        }


def wrap(draw, string, text_font, max_width):
    words, lines, line = string.split(), [], ""
    for word in words:
        candidate = word if not line else line + " " + word
        if draw.textlength(candidate, font=text_font) <= max_width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def font_fit(draw, string, max_width, max_lines, initial, minimum, name):
    for size in range(initial, minimum - 1, -2):
        text_font = font(name, size)
        lines = wrap(draw, string, text_font, max_width)
        if len(lines) <= max_lines:
            return text_font, lines
    raise ValueError(f"Could not fit text: {string}")


def render_card(book: dict) -> bytes:
    background, accent = PALETTE[book["category"]]
    image = Image.new("RGB", (900, 1350), background)
    draw = ImageDraw.Draw(image)
    white, muted = "#f7f5ed", "#c5c8c3"
    draw.rounded_rectangle((55, 55, 845, 1295), radius=22, outline=accent, width=3)
    draw.rectangle((90, 100, 810, 110), fill=accent)
    draw.text((90, 155), "SAVOTH  /  BOOK CATALOG", font=font("segoeuib.ttf", 27), fill=accent)
    draw.text((90, 225), LABELS[book["category"]].upper(), font=font("segoeui.ttf", 24), fill=muted)

    title_font, title_lines = font_fit(draw, book["title"], 715, 5, 76, 40, "segoeuib.ttf")
    title_y = 350
    for line in title_lines:
        draw.text((90, title_y), line, font=title_font, fill=white)
        title_y += title_font.size * 1.18
    draw.rectangle((90, title_y + 24, 260, title_y + 30), fill=accent)

    subtitle_font, subtitle_lines = font_fit(
        draw, book["subtitle"], 710, 7, 35, 24, "segoeui.ttf"
    )
    subtitle_y = max(780, title_y + 75)
    if subtitle_y + len(subtitle_lines) * subtitle_font.size * 1.45 > 1100:
        raise ValueError(f"Subtitle overflow: {book['id']}")
    for line in subtitle_lines:
        draw.text((90, subtitle_y), line, font=subtitle_font, fill=muted)
        subtitle_y += subtitle_font.size * 1.45

    draw.text((90, 1130), book["author"], font=font("segoeuib.ttf", 31), fill=white)
    draw.rectangle((90, 1193, 810, 1195), fill=accent)
    draw.text(
        (90, 1220),
        "CATALOG TITLE CARD  /  NOT THE PUBLISHED COVER",
        font=font("segoeuib.ttf", 20),
        fill=accent,
    )
    output = BytesIO()
    image.save(output, "WEBP", quality=82, method=6)
    return output.getvalue()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="regenerate only the 19 title cards")
    args = parser.parse_args()
    mismatches = []
    for book in card_metadata():
        path = BOOKS / "covers" / f"{book['id'].lower()}-metadata-card.webp"
        rendered = render_card(book)
        if args.write:
            path.write_bytes(rendered)
        elif not path.is_file() or path.read_bytes() != rendered:
            mismatches.append(path.name)
    if mismatches:
        raise SystemExit("Card mismatch: " + ", ".join(mismatches))
    print("Verified 19 metadata-only cards" if not args.write else "Rendered 19 metadata-only cards")


if __name__ == "__main__":
    main()
