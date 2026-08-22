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
          className="gap-1.5 rounded-full bg-[var(--wash-lilac)] px-3 py-1.5 text-xs font-normal text-muted-foreground shadow-none"
        >
          <Brain className="text-primary" />
          <span className="font-display italic text-foreground">Thought for a while</span>
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
    <div className={cn("flex w-full px-0.5 py-2.5", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex min-w-0 flex-col gap-2", isUser ? "max-w-[82%] items-end" : "w-full items-start")}>
        {message.parts.map((part, index) => {
          if (isTextUIPart(part)) {
            if (!part.text.trim()) return null;

            return (
              <div
                key={index}
                className={cn(
                  "text-[15px] leading-relaxed",
                  isUser
                    ? "rounded-[1.4rem] rounded-br-md bg-[var(--wash-sand)] px-4 py-3 text-[var(--text-strong)] shadow-[var(--shadow-control)]"
                    : "w-full px-0.5 py-1 text-foreground",
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
            <div key={index} className="flex w-full flex-wrap items-center gap-2">
              {activityParts.map((activityPart, pillIndex) => (
                <ActivityPill key={`${index}-${pillIndex}`} part={activityPart} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
