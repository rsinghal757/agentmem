import type { UIMessage } from "ai";

export type PersistedHistoryMessageRow = {
  messageUuid: string;
  role: string;
  content: string;
  parts?: string | null;
};

export type PersistableHistoryMessage = {
  messageUuid: string;
  role: string;
  content: string;
  parts: string;
};

export type PersistedMessageSnapshot = Map<string, string>;

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`);

  return `{${entries.join(",")}}`;
}

function deriveTextContent(parts: UIMessage["parts"]): string {
  return parts
    .filter((part) => part.type === "text")
    .map((part) => ("text" in part ? part.text : ""))
    .join("\n")
    .trim();
}

export function buildPersistableHistoryMessage(message: UIMessage): PersistableHistoryMessage {
  return {
    messageUuid: message.id,
    role: message.role,
    // Keep derived text content for thread previews/search; parts remain rendering source of truth.
    content: deriveTextContent(message.parts),
    // Persist all parts, including tool parts.
    parts: JSON.stringify(message.parts),
  };
}

export function getHistoryMessageSignature(message: UIMessage): string {
  const payload = buildPersistableHistoryMessage(message);
  return stableStringify({
    role: payload.role,
    content: payload.content,
    parts: JSON.parse(payload.parts),
  });
}

function safeParseParts(rawParts?: string | null): UIMessage["parts"] {
  if (!rawParts) return [];

  try {
    const parsed = JSON.parse(rawParts);
    return Array.isArray(parsed) ? (parsed as UIMessage["parts"]) : [];
  } catch {
    return [];
  }
}

export function mapPersistedRowsToUIMessages(
  rows: PersistedHistoryMessageRow[],
): UIMessage[] {
  return rows.map((row) => {
    const parsedParts = safeParseParts(row.parts);
    const hasRenderableParts = parsedParts.length > 0;
    const fallbackText = row.content.trim();

    return {
      id: row.messageUuid,
      role: row.role as UIMessage["role"],
      // Hydration source of truth is persisted parts. Only fallback to content when parts are unavailable.
      parts: hasRenderableParts
        ? parsedParts
        : fallbackText
          ? [{ type: "text" as const, text: fallbackText }]
          : [],
    };
  });
}

export function collectUnsavedHistoryMessages(
  messages: UIMessage[],
  persistedSnapshots: PersistedMessageSnapshot,
): PersistableHistoryMessage[] {
  return messages
    .map((message) => ({
      payload: buildPersistableHistoryMessage(message),
      signature: getHistoryMessageSignature(message),
    }))
    .filter(({ payload, signature }) => {
      const lastSignature = persistedSnapshots.get(payload.messageUuid);
      return lastSignature !== signature;
    })
    .map(({ payload }) => payload)
    .filter((message) => message.content || message.parts !== "[]");
}
