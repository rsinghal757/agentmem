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

export type PersistedHistoryMessageSignatures = Map<string, string>;

function safeParseParts(rawParts?: string | null): UIMessage["parts"] {
  if (!rawParts) return [];

  try {
    const parsed = JSON.parse(rawParts);
    return Array.isArray(parsed) ? (parsed as UIMessage["parts"]) : [];
  } catch {
    return [];
  }
}

function textFromParts(parts: UIMessage["parts"]): string {
  return parts
    .filter((part) => part.type === "text")
    .map((part) => ("text" in part ? part.text : ""))
    .join("\n")
    .trim();
}

export function getHistoryMessageSignature(message: PersistableHistoryMessage): string {
  return `${message.role}\n${message.content}\n${message.parts}`;
}

export function toPersistableHistoryMessage(message: UIMessage): PersistableHistoryMessage {
  return {
    messageUuid: message.id,
    role: message.role,
    content: textFromParts(message.parts),
    parts: JSON.stringify(message.parts),
  };
}

export function buildPersistedHistorySignatures(
  messages: UIMessage[],
): PersistedHistoryMessageSignatures {
  const signatures: PersistedHistoryMessageSignatures = new Map();

  for (const message of messages) {
    const persistable = toPersistableHistoryMessage(message);
    signatures.set(message.id, getHistoryMessageSignature(persistable));
  }

  return signatures;
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

export function collectMessagesToPersist(
  messages: UIMessage[],
  persistedSignatures: PersistedHistoryMessageSignatures,
): PersistableHistoryMessage[] {
  return messages
    .map(toPersistableHistoryMessage)
    .filter((message) => message.content || message.parts !== "[]")
    .filter(
      (message) =>
        persistedSignatures.get(message.messageUuid) !==
        getHistoryMessageSignature(message),
    );
}
