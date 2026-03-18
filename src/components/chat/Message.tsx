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

  return (
    <div
      className={cn(
        "flex w-full gap-3 px-2 py-2.5",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#D2E0D8] bg-[#1F6A4F] text-xs font-semibold text-white">
          0x
        </div>
      )}

      <div
        className={cn(
          "flex max-w-[82%] flex-col gap-2",
          isUser ? "items-end" : "items-start",
        )}
      >
        {message.parts.map((part, index) => {
          if (isTextUIPart(part)) {
            if (!part.text.trim()) {
              return null;
            }

            return (
              <div
                key={index}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-[15px] leading-[1.65] shadow-[0_8px_20px_-18px_rgba(14,36,28,0.55)]",
                  isUser
                    ? "border-[#1F6A4F] bg-[#1F6A4F] text-white"
                    : "border-[#DCE5DF] bg-white text-[#1A2521]",
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
            if (!part.text.trim()) {
              return null;
            }

            return (
              <details
                key={index}
                className={cn(
                  "group w-full rounded-xl border border-dashed px-4 py-3 text-[14px] leading-[1.6]",
                  isUser
                    ? "border-[#6A8C7E] bg-[#ECF4EF] text-[#244538]"
                    : "border-[#C9D9D1] bg-[#F6FAF7] text-[#355B4D]",
                )}
              >
                <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.09em] opacity-80 marker:content-['']">
                  <span className="group-open:hidden">Show reasoning</span>
                  <span className="hidden group-open:inline">Hide reasoning</span>
                </summary>
                <div className="mt-2">
                  <MarkdownContent
                    content={part.text}
                    isInverted={isUser}
                    className={cn(isUser && "prose-code:text-white")}
                  />
                </div>
              </details>
            );
          }

          if (isToolUIPart(part)) {
            const toolName = getToolName(part) || "unknown";
            const args = (part.input ?? {}) as Record<string, unknown>;
            const result = part.output as Record<string, unknown> | undefined;

            return (
              <ToolCallBadge
                key={index}
                toolName={toolName}
                args={args}
                result={result}
              />
            );
          }

          return null;
        })}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#DCE5DF] bg-[#F7FAF8] text-xs font-semibold text-[#5C6D66]">
          You
        </div>
      )}
    </div>
  );
}
