"use client";

import type { UIMessage } from "ai";
import { isTextUIPart, isToolUIPart, getToolName } from "ai";
import { Brain } from "lucide-react";
import { ToolCallBadge } from "./ToolCallBadge";
import { MarkdownContent } from "@/components/shared/MarkdownContent";
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

  const textContent = message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("\n\n");
  const isLongAssistant = !isUser && textContent.length > 520;
  const hasReasoning = message.parts.some(
    (part) => isReasoningPart(part) && part.text.trim(),
  );
  const toolParts = message.parts.filter(isToolUIPart);

  return (
    <div className={cn("flex w-full px-1 py-2.5 sm:px-2", isUser ? "justify-end" : "justify-center")}>
      <div
        className={cn(
          "flex w-full gap-3",
          isUser ? "max-w-3xl justify-end" : "max-w-4xl justify-start",
        )}
      >
        {!isUser && (
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] bg-primary text-[0.65rem] font-semibold text-primary-foreground shadow-[var(--shadow-control)]">
            0x
          </div>
        )}

        <div className={cn("flex min-w-0 flex-col gap-2", isUser ? "max-w-[82%] items-end" : "flex-1 items-start")}>
          {!isUser && (hasReasoning || toolParts.length > 0) && (
            <div className="flex max-w-full flex-wrap items-center gap-2">
              {hasReasoning && (
                <Badge
                  variant="outline"
                  className="gap-1.5 rounded-lg bg-card px-2.5 py-1.5 text-xs font-normal text-muted-foreground shadow-[var(--shadow-control)]"
                >
                  <Brain className="text-primary" />
                  <span className="font-medium text-foreground">Thought for a while</span>
                </Badge>
              )}
              {toolParts.map((part, index) => {
                const toolName = getToolName(part) || "unknown";
                const args = (part.input ?? {}) as Record<string, unknown>;
                const result = part.output as Record<string, unknown> | undefined;

                return (
                  <ToolCallBadge
                    key={`tool-${index}`}
                    toolName={toolName}
                    args={args}
                    result={result}
                  />
                );
              })}
            </div>
          )}

          {message.parts.map((part, index) => {
            if (isTextUIPart(part)) {
              if (!part.text.trim()) return null;

              return (
                <div
                  key={index}
                  className={cn(
                    "text-[15px] leading-relaxed",
                    isUser
                      ? "rounded-2xl rounded-tr-md bg-primary px-4 py-2.5 text-primary-foreground shadow-[var(--shadow-control)]"
                      : isLongAssistant
                        ? "w-full rounded-[var(--radius-panel)] border bg-card px-5 py-5 text-foreground shadow-[var(--shadow-raised)] sm:px-7 sm:py-6"
                        : "max-w-2xl rounded-[var(--radius-panel)] border bg-card px-4 py-3 text-foreground shadow-[var(--shadow-control)]",
                  )}
                >
                  <MarkdownContent
                    content={part.text}
                    isInverted={isUser}
                    className={cn(isUser && "prose-code:text-white")}
                  />
                </div>
              );
            }

            return null;
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
