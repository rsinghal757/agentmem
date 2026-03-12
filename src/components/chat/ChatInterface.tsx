"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useCallback } from "react";
import { Message } from "./Message";
import {
  Send,
  Loader2,
  Trash2,
  MessageSquarePlus,
  PanelLeft,
  X,
} from "lucide-react";
import { cn, DEFAULT_THREAD_ID } from "@/lib/utils";

type ThreadSummary = {
  id: string;
  title: string;
  preview: string | null;
  updatedAt?: string;
};

export function ChatInterface() {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [activeThreadId, setActiveThreadId] = useState(DEFAULT_THREAD_ID);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [input, setInput] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ threadId: activeThreadId }),
    }),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const persistedMessageIds = useRef<Set<string>>(new Set());

  const isLoading = status === "streaming" || status === "submitted";

  const loadThreads = useCallback(async () => {
    const res = await fetch("/api/chat/threads");
    const data = await res.json();
    const loaded = (data.threads || []) as ThreadSummary[];
    if (loaded.length === 0) {
      const createRes = await fetch("/api/chat/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: DEFAULT_THREAD_ID, title: "New chat" }),
      });
      const createData = await createRes.json();
      setThreads([
        {
          id: createData.thread.id,
          title: createData.thread.title,
          preview: null,
        },
      ]);
      setActiveThreadId(createData.thread.id);
      return;
    }

    setThreads(loaded);
    if (!loaded.find((t) => t.id === activeThreadId)) {
      setActiveThreadId(loaded[0].id);
    }
  }, [activeThreadId]);

  const loadHistory = useCallback(async (threadId: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/chat/history?threadId=${encodeURIComponent(threadId)}`);
      const data = await res.json();
      const loadedMessages: UIMessage[] = (data.messages || []).map(
        (m: {
          messageUuid: string;
          role: string;
          content: string;
          createdAt?: string;
        }) => ({
          id: m.messageUuid,
          role: m.role as "user" | "assistant",
          parts: [{ type: "text" as const, text: m.content }],
        }),
      );
      setMessages(loadedMessages);
      persistedMessageIds.current = new Set(loadedMessages.map((m) => m.id));
    } catch (e) {
      console.error("Failed to load chat history:", e);
      setMessages([]);
      persistedMessageIds.current = new Set();
    } finally {
      setIsLoadingHistory(false);
    }
  }, [setMessages]);

  useEffect(() => {
    loadThreads().catch((e) => console.error("Failed to load threads", e));
  }, [loadThreads]);

  useEffect(() => {
    loadHistory(activeThreadId).catch((e) => console.error("Failed to load history", e));
  }, [activeThreadId, loadHistory]);

  useEffect(() => {
    if (isLoadingHistory) return;

    const unsaved = messages
      .filter((m) => (m.role === "user" || m.role === "assistant") && !persistedMessageIds.current.has(m.id))
      .map((m) => {
        const textPart = m.parts.find((p) => p.type === "text");
        return {
          messageUuid: m.id,
          role: m.role,
          content: textPart && "text" in textPart ? textPart.text : "",
        };
      })
      .filter((m) => m.content);

    if (unsaved.length === 0) return;

    fetch("/api/chat/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: activeThreadId, messages: unsaved }),
    })
      .then(() => {
        for (const message of unsaved) {
          persistedMessageIds.current.add(message.messageUuid);
        }
        loadThreads().catch(() => {});
      })
      .catch(console.error);
  }, [messages, isLoadingHistory, activeThreadId, loadThreads]);

  async function clearThread() {
    await fetch(`/api/chat/history?threadId=${encodeURIComponent(activeThreadId)}`, {
      method: "DELETE",
    });
    setMessages([]);
    persistedMessageIds.current = new Set();
    await loadThreads();
  }

  async function createNewThread() {
    const res = await fetch("/api/chat/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: crypto.randomUUID(), title: "New chat" }),
    });
    const data = await res.json();
    setActiveThreadId(data.thread.id);
    setIsHistoryOpen(false);
    await loadThreads();
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <div className="relative flex h-full bg-[#F7F8F6]">
      {isHistoryOpen && (
        <button
          type="button"
          aria-label="Close chat history"
          onClick={() => setIsHistoryOpen(false)}
          className="absolute inset-0 z-20 bg-black/25 md:hidden"
        />
      )}

      <aside
        className={cn(
          "absolute bottom-0 left-0 top-0 z-30 w-72 border-r border-[#E8EAE7] bg-white p-3 transition-transform duration-200 md:static md:w-64 md:translate-x-0",
          isHistoryOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-3 flex items-center justify-between md:hidden">
          <p className="text-sm font-medium text-[#1C1C1C]">Chat history</p>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(false)}
            className="rounded-md p-1 text-[#6B6B6B] hover:bg-[#F7F8F6] hover:text-[#1C1C1C]"
            aria-label="Close chat history"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={createNewThread}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#E8EAE7] px-3 py-2 text-sm text-[#1C1C1C] hover:bg-[#F7F8F6]"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </button>
        <div className="space-y-1">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => {
                setActiveThreadId(thread.id);
                setIsHistoryOpen(false);
              }}
              className={cn(
                "w-full rounded-[8px] px-3 py-2 text-left",
                thread.id === activeThreadId ? "bg-[#EEF0EC]" : "hover:bg-[#F7F8F6]",
              )}
            >
              <div className="truncate text-sm font-medium">{thread.title || "New chat"}</div>
              <div className="truncate text-xs text-[#6B6B6B]">{thread.preview || "No messages yet"}</div>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex h-full flex-1 flex-col bg-[#F7F8F6]">
        <div className="border-b border-[#E8EAE7] bg-white px-4 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 rounded-[8px] border border-[#E8EAE7] px-3 py-1.5 text-sm text-[#1C1C1C]"
          >
            <PanelLeft className="h-4 w-4" />
            History
          </button>
        </div>
        {messages.length > 0 && (
          <div className="flex justify-end border-b border-[#E8EAE7] bg-white px-6 py-2">
            <button
              onClick={clearThread}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-[#6B6B6B] hover:bg-[#F7F8F6] hover:text-[#1C1C1C]"
            >
              <Trash2 className="h-3 w-3" />
              Clear thread
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6">
          {isLoadingHistory ? (
            <div className="flex h-full items-center justify-center bg-[#F7F8F6]">
              <Loader2 className="h-6 w-6 animate-spin text-[#0B6B3A]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-[#6B6B6B]">Start a new conversation</div>
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
    </div>
  );
}
