"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import { Message } from "./Message";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSubmit = () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    sendMessage({ text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-6xl">🧠</div>
              <h2 className="mb-2 text-xl font-semibold text-neutral-200">
                Obsidian Memory Agent
              </h2>
              <p className="max-w-md text-sm text-neutral-400">
                I&apos;m your AI assistant with a personal knowledge vault. As
                we chat, I&apos;ll build and maintain an Obsidian-compatible
                wiki of everything we discuss.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "Tell me about yourself",
                  "I'm working on a project",
                  "What do you know about me?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-violet-500 hover:text-violet-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="pb-4">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                  A
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-neutral-800 p-4">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... I'll remember it."
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 pr-12 text-sm text-neutral-100 placeholder-neutral-500",
              "focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500",
              "max-h-32",
            )}
            style={{
              height: "auto",
              minHeight: "44px",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute bottom-2.5 right-2.5 rounded-lg p-1.5 transition-colors",
              input.trim() && !isLoading
                ? "bg-violet-600 text-white hover:bg-violet-500"
                : "text-neutral-600",
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
