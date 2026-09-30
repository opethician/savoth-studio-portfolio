import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const index = await readFile(new URL("docs/index.html", root), "utf8");
const notFound = await readFile(new URL("docs/404.html", root), "utf8");
const styles = await readFile(new URL("docs/styles.css", root), "utf8");
const script = await readFile(new URL("docs/script.js", root), "utf8");
const robots = await readFile(new URL("docs/robots.txt", root), "utf8");
const sitemap = await readFile(new URL("docs/sitemap.xml", root), "utf8");
const books = await readFile(new URL("docs/books/index.html", root), "utf8");
const favicon = await readFile(new URL("docs/assets/savoth-mark.svg", root), "utf8");

test("portfolio has a semantic, indexable homepage", () => {
  assert.match(index, /<main id="main-content">/);
  assert.equal((index.match(/<h1\b/g) ?? []).length, 1);
  assert.match(index, /rel="canonical"/);
  assert.match(index, /meta name="description"/);
  assert.match(index, /Skip to main content/);
  assert.doesNotMatch(index, /<form\b|<iframe\b|google-analytics|gtag\(/i);
});

test("all three public projects have canonical source and Savoth contact links", () => {
  for (const repository of [
    "savoth-landing-page-lab",
    "savoth-reel-brief",
    "savoth-agent-workbench",
  ]) {
    assert.match(index, new RegExp(`github\\.com/opethician/${repository}`));
  }

  assert.equal((index.match(/aria-label="Contact Savoth about /g) ?? []).length, 3);
  assert.doesNotMatch(index, /freelancer\.com\/service\//i);
  assert.doesNotMatch(index, /freelancer\.com\/u\/(?:Savoth|AyushiOpethician)/i);
  assert.match(index, /href="books\/"[^>]*>Books</);
});

test("copy avoids unsupported portfolio claims", () => {
  assert.doesNotMatch(
    index,
    /award-winning|trusted by|clients served|conversion rate|guaranteed results|five-star service/i,
  );
  assert.match(index, /0<\/strong><span>invented client or outcome claims/);
  assert.match(index, /No payment is requested on this site/);
  assert.doesNotMatch(index, /platform checkout|Matching checkout path/i);
});

test("all pages use the Savoth favicon", () => {
  assert.match(index, /href="assets\/savoth-mark\.svg"/);
  assert.match(books, /href="\.\.\/assets\/savoth-mark\.svg"/);
  assert.match(notFound, /href="\/savoth-studio-portfolio\/assets\/savoth-mark\.svg"/);
  assert.match(favicon, />Sv<\/text>/);
  assert.doesNotMatch(index, /class="boundary-mark"[^>]*>pQ</);
});

test("responsive and reduced-motion rules are present", () => {
  assert.match(styles, /@media \(max-width: 980px\)/);
  assert.match(styles, /@media \(max-width: 700px\)/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /:focus-visible/);
});

test("project filtering is progressive enhancement only", () => {
  assert.match(script, /querySelectorAll\("\[data-filter\]"\)/);
  assert.match(script, /project\.hidden = !shouldShow/);
  assert.match(index, /aria-live="polite"/);
  assert.equal((index.match(/data-category=/g) ?? []).length, 3);
});

test("404 page is local and helpful", () => {
  assert.match(notFound, /Page not found/);
  assert.match(notFound, /href="\/savoth-studio-portfolio\/"/);
  assert.match(
    notFound,
    /href="\/savoth-studio-portfolio\/styles\.css"/,
  );
  assert.doesNotMatch(notFound, /https?:\/\/[^"']+\.(?:js|css|woff|png|jpg)/i);
});

test("main/docs is ready for branch-based GitHub Pages", () => {
  const productionUrl =
    "https://opethician.github.io/savoth-studio-portfolio/";
  assert.match(index, new RegExp(productionUrl.replaceAll(".", "\\.")));
  assert.match(robots, /savoth-studio-portfolio\/sitemap\.xml/);
  assert.match(sitemap, new RegExp(productionUrl.replaceAll(".", "\\.")));
});

test("books release preserves catalog cards and held purchase links", () => {
  assert.equal((books.match(/class="book-card"/g) ?? []).length, 19);
  assert.equal((books.match(/class="edition-link"/g) ?? []).length, 36);
  assert.match(books, /This title is under editorial review\. Its edition links are temporarily unavailable here\./);
  assert.doesNotMatch(books, /https:\/\/www\.amazon\.com\/dp\/(?:B0HH96CKG5|B0HGGZDMN6|B0HGHGWF9W)/);
  for (const id of ["BOOK-5", "BOOK-16"]) {
    const card = books.match(new RegExp(`<article[^>]+id="${id}"[^>]*>[\\s\\S]*?<\\/article>`))?.[0];
    assert.ok(card, `${id} card must remain in the catalog`);
    assert.doesNotMatch(card, /class="edition-link"|https:\/\/www\.amazon\.com\/dp\//);
    assert.doesNotMatch(card, /view Amazon for the current cover|View Amazon for the current cover and edition details/i);
    assert.match(card, /book-editions-section--review/);
    if (id !== "BOOK-5") {
      assert.match(card, /Edition update in progress\. Purchase links will return after review\./);
    }
  }
  assert.doesNotMatch(books, /https:\/\/www\.amazon\.com\/dp\/(?:B0HHY1DFLV|B0HHY8TTRZ|B0HL4MQ697)/);
  assert.equal((books.match(/class="regional-storefronts-links"/g) ?? []).length, 3);
  assert.equal((books.match(/-metadata-card\.webp/g) ?? []).length, 18);
  assert.equal((books.match(/Substitute catalog title card<\/figcaption>/g) ?? []).length, 18);
  assert.equal((books.match(/Kindle cover<\/figcaption>/g) ?? []).length, 1);
  assert.match(books, /The other 18 books use substitute catalog title cards\./);
  assert.doesNotMatch(books, /Each book has a substitute catalog title card\.|TITLE CARDS ARE CATALOG SUBSTITUTES/);
  assert.match(books, /name="robots" content="index,follow"/);
  assert.match(books, /savoth-studio-portfolio\/books\//);
  assert.match(sitemap, /savoth-studio-portfolio\/books\//);
  assert.doesNotMatch(books, /media\/|video-lane|book-slides|noindex,nofollow/);
  assert.doesNotMatch(books, /freelancer\.com\/u\/Savoth|AyushiOpethician/);
});

test("BOOK15 links only its approved Kindle edition and exact free worksheet", async () => {
  const card = books.match(/<article[^>]+id="BOOK-15"[^>]*>[\s\S]*?<\/article>/)?.[0];
  assert.ok(card, "BOOK15 card must remain in the catalog");
  assert.equal((card.match(/class="edition-link"/g) ?? []).length, 1);
  assert.match(card, /href="https:\/\/www\.amazon\.com\/dp\/B0HL1VW2D9"/);
  assert.match(card, /View Kindle on Amazon/);
  assert.doesNotMatch(card, /Paperback|book-editions-section--review|Edition update in progress/);
  assert.match(card, /src="covers\/book-15-kindle-cover\.jpg"[^>]*width="1600" height="2560"/);
  assert.match(card, /href="resources\/BOOK15-WEEKLY-PROJECT-STATUS-REVIEW-WORKSHEET\.pdf"/);
  assert.match(card, /Free status review worksheet \(PDF\)/);
  const cover = await readFile(new URL("docs/books/covers/book-15-kindle-cover.jpg", root));
  const worksheet = await readFile(new URL("docs/books/resources/BOOK15-WEEKLY-PROJECT-STATUS-REVIEW-WORKSHEET.pdf", root));
  assert.equal(createHash("sha256").update(cover).digest("hex"), "483874a57889c1dc2b80dd7df2d3a31b7e32cfc585b88d6b1273b199e6594e67");
  assert.equal(createHash("sha256").update(worksheet).digest("hex"), "f48146ec72aba1209492af0f4a74c90649218aab2f14d3bd098b12e894001d8f");
  assert.equal(worksheet.subarray(0, 5).toString("ascii"), "%PDF-");
});
