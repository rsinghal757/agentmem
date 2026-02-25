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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
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
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  isUser
                    ? "bg-violet-600 text-white"
                    : "bg-neutral-800 text-neutral-100",
                )}
              >
                <div className="whitespace-pre-wrap">{part.text}</div>
              </div>
            );
          }

          if (isToolUIPart(part)) {
            const toolName = getToolName(part);
            const args = ("input" in part ? part.input : {}) as Record<
              string,
              unknown
            >;
            const result =
              "output" in part
                ? (part.output as Record<string, unknown>)
                : undefined;

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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-600 text-sm font-bold text-white">
          U
        </div>
      )}
    </div>
  );
}
