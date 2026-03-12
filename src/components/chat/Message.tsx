"use client";

import type { UIMessage } from "ai";
import { isTextUIPart, isToolUIPart, getToolName } from "ai";
import { ToolCallBadge } from "./ToolCallBadge";
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
        "flex w-full gap-3 px-2 py-2",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#0B6B3A] text-sm font-medium text-white">
          A
        </div>
      )}

      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* Message parts */}
        {message.parts.map((part, index) => {
          if (isTextUIPart(part)) {
            if (!part.text.trim()) {
              return null;
            }

            return (
              <div
                key={index}
                className={cn(
                  "rounded-[10px] border border-[#E8EAE7] px-4 py-3 text-[15px] leading-[1.6]",
                  isUser
                    ? "border-[#0B6B3A] bg-[#0B6B3A] text-white"
                    : "bg-white text-[#1C1C1C]",
                )}
              >
                <div className="whitespace-pre-wrap">{part.text}</div>
              </div>
            );
          }

          if (isReasoningPart(part)) {
            if (!part.text.trim()) {
              return null;
            }

            return (
              <div
                key={index}
                className={cn(
                  "rounded-[10px] border border-dashed px-4 py-3 text-[14px] leading-[1.6]",
                  isUser
                    ? "border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#4C1D95]"
                    : "border-[#C4B5FD] bg-[#F5F3FF] text-[#5B21B6]",
                )}
              >
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-75">
                  Reasoning
                </div>
                <div className="whitespace-pre-wrap">{part.text}</div>
              </div>
            );
          }

          if (isToolUIPart(part)) {
            const toolName = getToolName(part) || "unknown";
            // Safely extract input with fallback to empty object
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

          // Skip step-start and other non-renderable parts
          return null;
        })}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[#E8EAE7] bg-white text-sm font-medium text-[#6B6B6B]">
          U
        </div>
      )}
    </div>
  );
}
