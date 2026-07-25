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

test("portfolio has a semantic, indexable homepage", () => {
  assert.match(index, /<main id="main-content">/);
  assert.equal((index.match(/<h1\b/g) ?? []).length, 1);
  assert.match(index, /rel="canonical"/);
  assert.match(index, /meta name="description"/);
  assert.match(index, /Skip to main content/);
  assert.doesNotMatch(index, /<form\b|<iframe\b|google-analytics|gtag\(/i);
});

test("all three public projects and platform checkouts are linked", () => {
  for (const repository of [
    "porqpine-landing-page-lab",
    "porqpine-reel-brief",
    "porqpine-agent-workbench",
  ]) {
    assert.match(index, new RegExp(`github\\.com/opethician/${repository}`));
  }

  assert.match(index, /freelancer\.com\/service\/website_testing/);
  assert.match(index, /freelancer\.com\/service\/video_editing/);
  assert.match(index, /freelancer\.com\/service\/ai_chatbot_development/);
  assert.match(index, /freelancer\.com\/u\/AyushiOpethician/);
});

test("copy avoids unsupported portfolio claims", () => {
  assert.doesNotMatch(
    index,
    /award-winning|trusted by|clients served|conversion rate|guaranteed results|five-star service/i,
  );
  assert.match(index, /0<\/strong><span>invented client or outcome claims/);
  assert.match(index, /No off-platform payment is requested/);
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
  assert.match(notFound, /href="\/porqpine-studio-portfolio\/"/);
  assert.match(
    notFound,
    /href="\/porqpine-studio-portfolio\/styles\.css"/,
  );
  assert.doesNotMatch(notFound, /https?:\/\/[^"']+\.(?:js|css|woff|png|jpg)/i);
});

test("main/docs is ready for branch-based GitHub Pages", () => {
  const productionUrl =
    "https://opethician.github.io/porqpine-studio-portfolio/";
  assert.match(index, new RegExp(productionUrl.replaceAll(".", "\\.")));
  assert.match(robots, /porqpine-studio-portfolio\/sitemap\.xml/);
  assert.match(sitemap, new RegExp(productionUrl.replaceAll(".", "\\.")));
});
