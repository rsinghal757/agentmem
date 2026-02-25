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
    <div className="flex h-full flex-col rounded-2xl bg-gradient-to-b from-neutral-950/40 via-neutral-950/20 to-neutral-950/50">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-neutral-900/50 px-8 py-10 text-center shadow-[0_24px_60px_-45px_rgba(124,58,237,0.85)] backdrop-blur">
              <div className="mb-4 text-5xl">🧠</div>
              <h2 className="mb-2 text-xl font-semibold tracking-tight text-neutral-100">
                Obsidian Memory Agent
              </h2>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-neutral-400">
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
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 transition-all hover:border-violet-400/60 hover:bg-violet-500/10 hover:text-violet-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="pb-4 pt-2">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white shadow-sm">
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
      <div className="border-t border-white/10 p-4">
        <div className="relative rounded-2xl border border-white/10 bg-neutral-900/70 p-2 shadow-[0_12px_35px_-24px_rgba(124,58,237,0.9)]">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... I'll remember it."
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 pr-12 text-sm text-neutral-100 placeholder-neutral-500",
              "focus:border-violet-400/70 focus:outline-none focus:ring-2 focus:ring-violet-500/30",
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
              "absolute bottom-4 right-4 rounded-lg p-2 transition-all",
              input.trim() && !isLoading
                ? "bg-violet-500 text-white shadow-[0_10px_24px_-14px_rgba(139,92,246,0.95)] hover:bg-violet-400"
                : "bg-neutral-800 text-neutral-600",
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
