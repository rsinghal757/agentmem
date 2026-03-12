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

    return {
      id: row.messageUuid,
      role: row.role as UIMessage["role"],
      parts:
        parsedParts.length > 0
          ? parsedParts
          : [{ type: "text" as const, text: row.content }],
    };
  });
}

export function collectUnsavedHistoryMessages(
  messages: UIMessage[],
  persistedMessageIds: Set<string>,
): PersistableHistoryMessage[] {
  return messages
    .filter((message) => !persistedMessageIds.has(message.id))
    .map((message) => {
      const textContent = message.parts
        .filter((part) => part.type === "text")
        .map((part) => ("text" in part ? part.text : ""))
        .join("\n")
        .trim();

      return {
        messageUuid: message.id,
        role: message.role,
        content: textContent,
        parts: JSON.stringify(message.parts),
      };
    })
    .filter((message) => message.content || message.parts !== "[]");
}
