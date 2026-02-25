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

  return (
    <div
      className={cn(
        "flex w-full gap-3 px-4 py-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white shadow-sm">
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
            return (
              <div
                key={index}
                className={cn(
                  "rounded-2xl border px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                  isUser
                    ? "border-violet-400/40 bg-violet-500 text-white"
                    : "border-white/10 bg-neutral-900/80 text-neutral-100",
                )}
              >
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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-neutral-700 text-sm font-bold text-white shadow-sm">
          U
        </div>
      )}
    </div>
  );
}
