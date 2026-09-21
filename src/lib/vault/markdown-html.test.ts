import test from "node:test";
import assert from "node:assert/strict";
import {
  markdownToHtml,
  serializeNoteContent,
  splitNoteContent,
} from "./markdown-html";

test("hard-wrapped source lines join into a single paragraph", () => {
  const html = markdownToHtml(
    "The BMV proposal is the cleanest table-top argument\nI know for taking gravity seriously.",
  );

  assert.equal(
    html,
    "<p>The BMV proposal is the cleanest table-top argument I know for taking gravity seriously.</p>",
  );
});

test("blank lines still separate paragraphs", () => {
  const html = markdownToHtml("First para.\n\nSecond para.");
  assert.equal(html.match(/<p>/g)?.length, 2);
});

test("ordered lists survive as ol", () => {
  const html = markdownToHtml("1. Prepare\n2. Wait\n3. Measure");

  assert.ok(html.includes("<ol>"));
  assert.equal(html.match(/<li>/g)?.length, 3);
  assert.ok(!html.includes("<ul>"));
});

test("indented list items nest", () => {
  const html = markdownToHtml("- outer\n  - inner\n- outer again");

  assert.equal(html.match(/<ul>/g)?.length, 2);
  assert.ok(html.includes("inner"));
});

test("GFM tables become real tables", () => {
  const html = markdownToHtml(
    "| Requirement | Scale |\n| --- | --- |\n| Mass | 1e-14 kg |\n| Separation | 100 um |",
  );

  assert.ok(html.includes("<table>"));
  assert.ok(html.includes("<th>Requirement</th>"));
  assert.equal(html.match(/<tr>/g)?.length, 3);
});

test("rules, quotes and fenced code are preserved", () => {
  const html = markdownToHtml("---\n\n> quoted\n\n```ts\nconst a = 1;\n```");

  assert.ok(html.includes("<hr>"));
  assert.ok(html.includes("<blockquote>quoted</blockquote>"));
  assert.ok(html.includes('<pre><code class="language-ts">const a = 1;</code></pre>'));
});

test("wikilinks stay as literal source text", () => {
  assert.ok(
    markdownToHtml("See [[concepts/lopf]] for the proof.").includes("[[concepts/lopf]]"),
  );
});

test("inline emphasis, strikethrough and code render", () => {
  const html = markdownToHtml("**bold** and *italic* and ~~gone~~ and `code`");

  assert.ok(html.includes("<strong>bold</strong>"));
  assert.ok(html.includes("<em>italic</em>"));
  assert.ok(html.includes("<s>gone</s>"));
  assert.ok(html.includes("<code>code</code>"));
});

test("raw html in the source is escaped", () => {
  assert.ok(markdownToHtml("<script>alert(1)</script>").includes("&lt;script&gt;"));
});

test("frontmatter splits from the body and rejoins unchanged", () => {
  const note = "---\ntitle: BMV\ntype: concept\n---\n\nThe body.\n";
  const { frontmatterBlock, body } = splitNoteContent(note);

  assert.equal(frontmatterBlock, "---\ntitle: BMV\ntype: concept\n---");
  assert.equal(body, "The body.");
  assert.equal(serializeNoteContent(frontmatterBlock, body), note);
});

test("notes without frontmatter round-trip", () => {
  const { frontmatterBlock, body } = splitNoteContent("Just a body.\n");

  assert.equal(frontmatterBlock, "");
  assert.equal(body, "Just a body.");
  assert.equal(serializeNoteContent(frontmatterBlock, body), "Just a body.\n");
});
