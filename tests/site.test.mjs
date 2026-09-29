import assert from "node:assert/strict";
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

test("books release preserves the exact catalog with substitute title cards", () => {
  assert.equal((books.match(/class="book-card"/g) ?? []).length, 19);
  assert.equal((books.match(/class="edition-link"/g) ?? []).length, 37);
  assert.match(books, /This title is under editorial review\. Its edition links are temporarily unavailable here\./);
  assert.doesNotMatch(books, /https:\/\/www\.amazon\.com\/dp\/(?:B0HH96CKG5|B0HGGZDMN6|B0HGHGWF9W)/);
  assert.equal((books.match(/class="regional-storefronts-links"/g) ?? []).length, 3);
  assert.equal((books.match(/-metadata-card\.webp/g) ?? []).length, 19);
  assert.equal((books.match(/Substitute catalog title card<\/figcaption>/g) ?? []).length, 19);
  assert.match(books, /name="robots" content="index,follow"/);
  assert.match(books, /savoth-studio-portfolio\/books\//);
  assert.match(sitemap, /savoth-studio-portfolio\/books\//);
  assert.doesNotMatch(books, /media\/|video-lane|book-slides|noindex,nofollow/);
  assert.doesNotMatch(books, /freelancer\.com\/u\/Savoth|AyushiOpethician/);
});
