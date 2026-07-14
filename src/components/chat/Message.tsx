"use client";

import type { UIMessage } from "ai";
import { isTextUIPart, isToolUIPart, getToolName } from "ai";
import { ToolCallBadge } from "./ToolCallBadge";
import { MarkdownContent } from "@/components/shared/MarkdownContent";
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

            if (isReasoningPart(part)) {
              if (!part.text.trim()) return null;

              return (
                <details
                  key={index}
                  className="group w-full rounded-xl border border-dashed bg-muted/65 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <summary className="cursor-pointer list-none text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-primary marker:content-['']">
                    <span className="group-open:hidden">Show reasoning</span>
                    <span className="hidden group-open:inline">Hide reasoning</span>
                  </summary>
                  <div className="mt-2">
                    <MarkdownContent content={part.text} isInverted={isUser} />
                  </div>
                </details>
              );
            }

            if (isToolUIPart(part)) {
              const toolName = getToolName(part) || "unknown";
              const args = (part.input ?? {}) as Record<string, unknown>;
              const result = part.output as Record<string, unknown> | undefined;

              return <ToolCallBadge key={index} toolName={toolName} args={args} result={result} />;
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
