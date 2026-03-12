import test from "node:test";
import assert from "node:assert/strict";
import type { UIMessage } from "ai";
import {
  buildPersistedHistorySignatures,
  collectMessagesToPersist,
  mapPersistedRowsToUIMessages,
} from "./history-mapping";

const toolPart = {
  type: "tool-vault_search",
  state: "output-available",
  input: { query: "alpha" },
  output: { success: true, results: [{ path: "alpha.md" }] },
};

test("persists all message segments for a thread with a tool call", () => {
  const messages = [
    {
      id: "m-user",
      role: "user",
      parts: [{ type: "text", text: "Find alpha" }],
    },
    {
      id: "m-assistant-tool",
      role: "assistant",
      parts: [toolPart],
    },
    {
      id: "m-assistant-text",
      role: "assistant",
      parts: [{ type: "text", text: "I found alpha.md" }],
    },
  ] as unknown as UIMessage[];

  const persisted = collectMessagesToPersist(messages, new Map());

  assert.equal(persisted.length, 3);
  assert.equal(persisted[1].role, "assistant");
  assert.match(persisted[1].parts, /"type":"tool-vault_search"/);
  assert.equal(persisted[1].content, "");
});

test("reopening history returns all persisted segments in order", () => {
  const rows = [
    {
      messageUuid: "m-user",
      role: "user",
      content: "Find alpha",
      parts: '[{"type":"text","text":"Find alpha"}]',
    },
    {
      messageUuid: "m-assistant-tool",
      role: "assistant",
      content: "",
      parts: JSON.stringify([toolPart]),
    },
    {
      messageUuid: "m-assistant-text",
      role: "assistant",
      content: "I found alpha.md",
      parts: '[{"type":"text","text":"I found alpha.md"}]',
    },
  ];

  const uiMessages = mapPersistedRowsToUIMessages(rows);

  assert.deepEqual(
    uiMessages.map((message) => message.id),
    ["m-user", "m-assistant-tool", "m-assistant-text"],
  );
  assert.equal(uiMessages[1].parts[0].type, "tool-vault_search");
});

test("history hydration does not discard tool-call message types", () => {
  const rows = [
    {
      messageUuid: "m-tool",
      role: "assistant",
      content: "",
      parts: JSON.stringify([toolPart]),
    },
  ];

  const uiMessages = mapPersistedRowsToUIMessages(rows);

  assert.equal(uiMessages.length, 1);
  assert.equal(uiMessages[0].role, "assistant");
  assert.equal(uiMessages[0].parts[0].type, "tool-vault_search");
});

test("updated tool-call message with same id is persisted again", () => {
  const initialMessages = [
    {
      id: "m-assistant",
      role: "assistant",
      parts: [{ type: "text", text: "Working..." }],
    },
  ] as unknown as UIMessage[];
  const signatures = buildPersistedHistorySignatures(initialMessages);

  const updatedMessages = [
    {
      id: "m-assistant",
      role: "assistant",
      parts: [
        { type: "text", text: "Working..." },
        toolPart,
        { type: "text", text: "Done" },
      ],
    },
  ] as unknown as UIMessage[];

  const toPersist = collectMessagesToPersist(updatedMessages, signatures);

  assert.equal(toPersist.length, 1);
  assert.match(toPersist[0].parts, /"type":"tool-vault_search"/);
  assert.match(toPersist[0].parts, /"text":"Done"/);
});
