# Savoth studio portfolio

This static site presents Savoth's public source projects and a dated catalog of
19 books. The public repositories are inspectable, and each project has a
direct Savoth contact link. The catalog title cards are substitutes, not retail
covers; Amazon shows current edition details and availability. The site does
not invent clients, outcomes, ratings, or performance metrics.

## Why static

The site does not need authentication, storage, analytics, or a contact
database. The linked repositories contain the interactive frontend and
stateless API examples. No live Freelancer checkout is linked until an actual
Savoth service listing is independently verified.

## Catalog card provenance

The 19 substitute title cards in `docs/books/covers/` were generated locally
from the public title, subtitle, category, and byline already in
`docs/books/index.html`. `tools/render_catalog_cards.py` uses original Pillow
shapes and raster text with the installed Windows Segoe UI fonts; it uses no
stock art, portraits, published cover images, remote assets, or AI image tool.
The cards explicitly identify themselves as catalog substitutes. Pillow
12.2.0 and the installed Windows Segoe UI fonts reproduced the committed
WebP files byte for byte. To verify, run `python tools/render_catalog_cards.py`
on Windows with Pillow installed. `--write` regenerates only those 19 files.

## Local preview

Serve `docs/` with any static server:

```bash
npx serve docs
```

Validation:

```bash
npm test
```

## Deployment

GitHub Pages publishes directly from `main/docs`. The repository contains no
deployment token, build-time secret, or third-party hosting dependency.

Proposed public URL (staging branch has not been pushed or deployed):

`https://opethician.github.io/savoth-studio-portfolio/`

## Boundaries

- No analytics, cookies, forms, trackers, remote fonts, or stock imagery
- No private deployment links
- No payment request on this site
- No unverified client, revenue, conversion, speed, or quality claim
