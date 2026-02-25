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
    <div className="flex h-full flex-col bg-[#F7F8F6]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="mx-auto max-w-xl rounded-[10px] border border-[#E8EAE7] bg-white px-6 py-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-[10px] border border-[#E8EAE7] bg-[#F7F8F6]">
                <span className="text-lg font-medium text-[#0B6B3A]">A</span>
              </div>
              <h2 className="mb-2 text-[24px] font-medium tracking-tight text-[#1C1C1C]">
                Obsidian Memory Agent
              </h2>
              <p className="text-[15px] leading-[1.6] text-[#6B6B6B]">
                Your AI assistant with a personal knowledge vault. I&apos;ll
                build and maintain an Obsidian-compatible wiki as we chat.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {[
                  "Tell me about yourself",
                  "I'm working on a project",
                  "What do you know about me?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="rounded-lg border border-[#E8EAE7] bg-white px-4 py-2 text-[13px] font-normal text-[#6B6B6B] hover:border-[#0B6B3A]/30 hover:text-[#1C1C1C]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1 pb-8 pt-6">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 px-2 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#0B6B3A] text-sm font-medium text-white">
                  A
                </div>
                <div className="flex items-center gap-2 text-[15px] text-[#6B6B6B]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0B6B3A]" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-[#E8EAE7] bg-[#F7F8F6] px-6 pb-4 pt-4">
        <div className="relative mx-auto max-w-3xl">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            className={cn(
              "w-full resize-none rounded-[10px] border border-[#E8EAE7] bg-white px-4 py-3 pr-12 text-[15px] font-normal text-[#1C1C1C] placeholder:text-[#6B6B6B]",
              "focus:outline-none",
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
              "absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-[8px] transition-colors",
              input.trim() && !isLoading
                ? "bg-[#0B6B3A] text-white hover:bg-[#0F7A43] active:bg-[#095C31]"
                : "bg-[#EEF0EC] text-[#6B6B6B]",
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
