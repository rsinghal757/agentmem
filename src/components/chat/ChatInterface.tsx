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
    <div className="flex h-full flex-col bg-white">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="mx-auto max-w-sm px-6 py-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F0E9]">
                <span className="text-3xl">🧠</span>
              </div>
              <h2 className="mb-2 text-lg font-semibold tracking-tight text-neutral-900">
                Obsidian Memory Agent
              </h2>
              <p className="text-sm leading-relaxed text-gray-500">
                Your AI assistant with a personal knowledge vault. I&apos;ll
                build and maintain an Obsidian-compatible wiki as we chat.
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
                    className="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-medium text-gray-600 transition-all active:scale-95 hover:border-[#6B8F71]/40 hover:bg-[#E8F0E9] hover:text-[#4A6B4F]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="pb-4 pt-3">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 px-2 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6B8F71] text-sm font-bold text-white">
                  A
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin text-[#6B8F71]" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 bg-white px-4 pb-3 pt-3">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            className={cn(
              "w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-sm text-neutral-900 placeholder-gray-400",
              "focus:border-[#6B8F71]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/20",
              "max-h-32",
            )}
            style={{
              height: "auto",
              minHeight: "48px",
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
              "absolute bottom-2.5 right-2.5 rounded-xl p-2.5 transition-all active:scale-95",
              input.trim() && !isLoading
                ? "bg-[#6B8F71] text-white shadow-sm hover:bg-[#4A6B4F]"
                : "bg-gray-100 text-gray-400",
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
