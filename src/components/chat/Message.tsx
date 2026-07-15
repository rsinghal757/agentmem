"use client";

import type { UIMessage } from "ai";
import { isTextUIPart, isToolUIPart, getToolName } from "ai";
import { Brain } from "lucide-react";
import { ToolCallBadge } from "./ToolCallBadge";
import {
  MarkdownContent,
  markdownWithWikiLinks,
} from "@/components/shared/MarkdownContent";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: UIMessage;
}

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
        <Badge
          variant="outline"
          className="gap-1.5 rounded-lg bg-card px-2.5 py-1.5 text-xs font-normal text-muted-foreground shadow-[var(--shadow-control)]"
        >
          <Brain className="text-primary" />
          <span className="font-medium text-foreground">Thought for a while</span>
        </Badge>
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
    <div className={cn("flex w-full px-1 py-2.5 sm:px-2", isUser ? "justify-end" : "justify-center")}>
      <div className={cn("flex w-full", isUser ? "max-w-3xl justify-end" : "max-w-4xl justify-start")}>
        <div className={cn("flex min-w-0 flex-col gap-2", isUser ? "max-w-[82%] items-end" : "flex-1 items-start")}>
          {message.parts.map((part, index) => {
            if (isTextUIPart(part)) {
              if (!part.text.trim()) return null;
              const isLongPart = !isUser && part.text.length > 520;

              return (
                <div
                  key={index}
                  className={cn(
                    "text-[15px] leading-relaxed",
                    isUser
                      ? "rounded-2xl rounded-tr-md bg-primary px-4 py-2.5 text-primary-foreground shadow-[var(--shadow-control)]"
                      : isLongPart
                        ? "w-full rounded-[var(--radius-panel)] border bg-card px-5 py-5 text-foreground shadow-[var(--shadow-raised)] sm:px-7 sm:py-6"
                        : "max-w-2xl rounded-[var(--radius-panel)] border bg-card px-4 py-3 text-foreground shadow-[var(--shadow-control)]",
                  )}
                >
                  <MarkdownContent
                    content={markdownWithWikiLinks(part.text)}
                    isInverted={isUser}
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
              <div key={index} className="flex w-full flex-wrap items-center gap-2">
                {activityParts.map((activityPart, pillIndex) => (
                  <ActivityPill key={`${index}-${pillIndex}`} part={activityPart} />
                ))}
              </div>
            );
          })}
        </div>

        {isUser && (
          <div className="mt-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] border bg-muted text-[0.65rem] font-medium text-muted-foreground sm:flex">
            You
          </div>
        )}
      </div>
    </div>
  );
}
