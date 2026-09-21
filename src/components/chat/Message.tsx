"use client";

import type { UIMessage } from "ai";
import { isTextUIPart, isToolUIPart, getToolName } from "ai";
import { Brain } from "lucide-react";
import { ToolCallBadge } from "./ToolCallBadge";
import {
  MarkdownContent,
  markdownWithWikiLinks,
} from "@/components/shared/MarkdownContent";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: UIMessage;
}

/**
 * Assistant turns render as bare prose so the panel reads like a margin
 * conversation rather than a chat app. Only the writer's own words get a
 * bubble, which keeps the eye anchored on what was asked.
 */
export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  const isReasoningPart = (
    part: UIMessage["parts"][number],
  ): part is UIMessage["parts"][number] & {
    type: "reasoning";
    text: string;
  } => {
    return (
      "type" in part &&
      part.type === "reasoning" &&
      "text" in part &&
      typeof part.text === "string"
    );
  };

  const isActivityPart = (part: UIMessage["parts"][number]) =>
    isToolUIPart(part) || (isReasoningPart(part) && part.text.trim().length > 0);

  const ActivityPill = ({ part }: { part: UIMessage["parts"][number] }) => {
    if (isReasoningPart(part)) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-faint)]">
          <Brain className="h-3 w-3" strokeWidth={1.5} />
          Thought it through
        </span>
      );
    }

    if (isToolUIPart(part)) {
      const toolName = getToolName(part) || "unknown";
      const args = (part.input ?? {}) as Record<string, unknown>;
      const result = part.output as Record<string, unknown> | undefined;

      return <ToolCallBadge toolName={toolName} args={args} result={result} />;
    }

    return null;
  };

  return (
    <div className={cn("flex w-full flex-col gap-1.5 py-2", isUser ? "items-end" : "items-start")}>
      {message.parts.map((part, index) => {
        if (isTextUIPart(part)) {
          if (!part.text.trim()) return null;

          return (
            <div
              key={index}
              className={cn(
                isUser
                  ? "sq-card max-w-[88%] border border-[color-mix(in_oklab,var(--brand),transparent_82%)] bg-[var(--brand-wash)] px-3 py-2 text-[var(--text-strong)]"
                  : "w-full text-[var(--text)]",
              )}
            >
              <MarkdownContent
                content={markdownWithWikiLinks(part.text)}
                variant="chat"
              />
            </div>
          );
        }

        if (!isActivityPart(part)) return null;

        const previousVisiblePart = message.parts.slice(0, index).findLast(
          (candidate) =>
            isActivityPart(candidate) ||
            (isTextUIPart(candidate) && candidate.text.trim().length > 0),
        );
        if (previousVisiblePart && isActivityPart(previousVisiblePart)) return null;

        const activityParts: UIMessage["parts"] = [];
        for (
          let activityIndex = index;
          activityIndex < message.parts.length;
          activityIndex += 1
        ) {
          const candidate = message.parts[activityIndex];
          if (isTextUIPart(candidate) && candidate.text.trim().length > 0) break;
          if (isActivityPart(candidate)) activityParts.push(candidate);
        }

        return (
          <div
            key={index}
            className="flex w-full flex-col items-start gap-1 border-l border-border py-0.5 pl-2.5"
          >
            {activityParts.map((activityPart, pillIndex) => (
              <ActivityPill key={`${index}-${pillIndex}`} part={activityPart} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
