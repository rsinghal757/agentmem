import test from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import {
  htmlToMarkdown,
  markdownToHtml,
  parseMarkdownForEditor,
  serializeNoteContent,
  splitNoteContent,
} from "./markdown-html";

// htmlToMarkdown reads the contenteditable surface through DOMParser, so the
// reverse direction needs a DOM to be testable outside a browser.
const dom = new Window();
const globals = globalThis as unknown as Record<string, unknown>;
globals.window = dom.window;
globals.DOMParser = dom.DOMParser;
globals.Node = dom.Node;
globals.HTMLElement = dom.HTMLElement;

/** What the editor would write back after opening a note and changing nothing. */
function roundTrip(markdown: string) {
  const { html, wrapMemory } = parseMarkdownForEditor(markdown);
  return htmlToMarkdown(html, wrapMemory);
}

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

test("opening and saving a note without editing it leaves the source alone", () => {
  const source = [
    "The BMV proposal is the cleanest table-top argument I know for taking the",
    "quantisation of gravity seriously. Two masses, each put into a spatial",
    "superposition, are allowed to interact **only** gravitationally.",
    "",
    "## Why the logic holds",
    "",
    "The load-bearing step is [[concepts/lopf]] — local operations and classical",
    "communication cannot create entanglement. So the argument runs:",
    "",
    "1. Prepare two masses in superposition, shielded from every non-gravitational",
    "   channel.",
    "2. Let them sit for a time `t` and accumulate a relative phase.",
    "",
    "> The experiment does not prove gravity is quantised. It rules out the",
    "> specific class of theories where gravity is fundamentally classical.",
    "",
    "| Requirement | Scale |",
    "| --- | --- |",
    "| Mass per particle | ~10 kg |",
    "",
    "- Does a *witness* result actually distinguish quantum gravity from a",
    "  non-local classical theory?",
    "- What is the minimum entanglement you could detect and still call it a",
    "  measurement rather than a fit?",
  ].join("\n");

  assert.equal(roundTrip(source), source);
});

test("every item in a list keeps its own wrapping, not just the first", () => {
  const source = [
    "1. Prepare two masses in superposition, shielded from every",
    "   non-gravitational channel.",
    "2. Let them sit for a time and accumulate a relative",
    "   phase.",
    "3. Recombine, then measure an entanglement",
    "   witness.",
  ].join("\n");

  assert.equal(roundTrip(source), source);
});

test("aligned table pipes are not squashed on save", () => {
  const source = [
    "| Requirement              | Scale     |",
    "| ------------------------ | --------- |",
    "| Mass per particle        | ~10 kg    |",
  ].join("\n");

  assert.equal(roundTrip(source), source);
});

test("a fenced block keeps its language on the way back out", () => {
  assert.equal(roundTrip("```ts\nconst a = 1;\n```"), "```ts\nconst a = 1;\n```");
});

test("an edited paragraph is written back as one line, not left stale", () => {
  const source = "The original wording spread\nacross two source lines.";
  const { wrapMemory } = parseMarkdownForEditor(source);

  const edited = htmlToMarkdown("<p>Rewritten in the editor as new prose.</p>", wrapMemory);
  assert.equal(edited, "Rewritten in the editor as new prose.");
});

test("blocks the writer never saw are still serialized correctly", () => {
  assert.equal(
    htmlToMarkdown("<h2>Fresh heading</h2><p>Fresh text.</p><hr>"),
    "## Fresh heading\n\nFresh text.\n\n---",
  );
});
