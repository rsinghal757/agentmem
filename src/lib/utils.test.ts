import test from "node:test";
import assert from "node:assert/strict";
import { displayThreadTitle, formatRelativeTime } from "./utils";

test("maps empty and default titles to Untitled", () => {
  assert.equal(displayThreadTitle(undefined), "Untitled");
  assert.equal(displayThreadTitle(null), "Untitled");
  assert.equal(displayThreadTitle(""), "Untitled");
  assert.equal(displayThreadTitle("New chat"), "Untitled");
});

test("keeps named thread titles", () => {
  assert.equal(displayThreadTitle("Research synthesis"), "Research synthesis");
});

test("returns null for missing or invalid relative times", () => {
  assert.equal(formatRelativeTime(undefined), null);
  assert.equal(formatRelativeTime("not-a-date"), null);
});

test("describes recent timestamps", () => {
  assert.equal(formatRelativeTime(new Date()), "Just now");
  assert.equal(formatRelativeTime(new Date(Date.now() - 5 * 60_000)), "5m ago");
});
