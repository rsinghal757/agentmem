"use client";

import { useChat } from "@ai-sdk/react";
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
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { cn, DEFAULT_THREAD_ID } from "@/lib/utils";
import { SidebarTabs } from "@/components/layout/BottomTabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  collectUnsavedHistoryMessages,
  getHistoryMessageSignature,
  mapPersistedRowsToUIMessages,
  type PersistedHistoryMessageRow,
  type PersistedMessageSnapshot,
} from "@/lib/chat/history-mapping";

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

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const persistedSnapshots = useRef<PersistedMessageSnapshot>(new Map());

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
      const loadedMessages = mapPersistedRowsToUIMessages(
        (data.messages || []) as PersistedHistoryMessageRow[],
      );
      setMessages(loadedMessages);
      persistedSnapshots.current = new Map(
        loadedMessages.map((message) => [message.id, getHistoryMessageSignature(message)]),
      );
    } catch (e) {
      console.error("Failed to load chat history:", e);
      setMessages([]);
      persistedSnapshots.current = new Map();
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

    const unsaved = collectUnsavedHistoryMessages(messages, persistedSnapshots.current);

    if (unsaved.length === 0) return;

    fetch("/api/chat/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: activeThreadId, messages: unsaved }),
    })
      .then(() => {
        const messagesById = new Map(messages.map((message) => [message.id, message]));
        for (const persistedMessage of unsaved) {
          const liveMessage = messagesById.get(persistedMessage.messageUuid);
          if (!liveMessage) continue;

          persistedSnapshots.current.set(
            persistedMessage.messageUuid,
            getHistoryMessageSignature(liveMessage),
          );
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
    persistedSnapshots.current = new Map();
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
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
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
    <div className="relative mx-auto flex h-full max-w-[1600px] gap-3 bg-transparent px-4 pb-4 pt-3">
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
          "absolute bottom-4 left-4 top-3 z-30 flex w-72 flex-col overflow-hidden rounded-2xl border border-[#DCE5DF] bg-white/85 p-3 shadow-[0_20px_50px_-42px_rgba(26,54,42,0.65)] backdrop-blur-md transition-transform duration-200 md:static md:top-0 md:w-72 md:translate-x-0",
          isHistoryOpen ? "translate-x-0" : "-translate-x-[110%]",
        )}
      >
        <div className="mb-4 flex items-center justify-between md:hidden">
          <p className="text-sm font-medium text-[#171B1A]">Conversations</p>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(false)}
            className="rounded-md p-1 text-[#62706A] hover:bg-[#EFF3EF] hover:text-[#171B1A]"
            aria-label="Close chat history"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 rounded-xl border border-[#E1E8E3] bg-[#F8FAF8] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-[#74827D]">Workspace</div>
              <div className="mt-1 text-lg font-semibold tracking-tight text-[#171B1A]">0xMem</div>
            </div>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className="rounded-lg border border-[#DCE5DF] bg-white px-2.5 py-1 text-xs font-medium text-[#171B1A] hover:bg-[#F5F7F5]">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        <Button
          onClick={createNewThread}
          variant="outline"
          className="mb-3 w-full justify-center rounded-xl"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </Button>

        <SidebarTabs />

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => {
                  setActiveThreadId(thread.id);
                  setIsHistoryOpen(false);
                }}
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-left transition-colors",
                  thread.id === activeThreadId
                    ? "border-[#CEDFD5] bg-[#F3F8F4]"
                    : "border-transparent hover:border-[#E0E7E2] hover:bg-[#F8FAF8]",
                )}
              >
                <div className="truncate text-sm font-medium text-[#18211E]">{thread.title || "New chat"}</div>
                <div className="truncate text-xs text-[#62706A]">{thread.preview || "No messages yet"}</div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <Card className="h-full min-w-0 flex-1 overflow-hidden border-[#DCE5DF] bg-white/80 shadow-[0_25px_65px_-48px_rgba(10,32,22,0.65)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-[#E2E8E4] bg-[#FAFCFB] px-4 py-2 md:px-5">
          <Button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            variant="outline"
            className="gap-2 md:hidden"
          >
            <PanelLeft className="h-4 w-4" />
            History
          </Button>

          {messages.length > 0 ? (
            <Button
              onClick={clearThread}
              variant="ghost"
              size="sm"
              className="ml-auto gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-3 w-3" />
              Clear thread
            </Button>
          ) : (
            <span className="text-xs text-[#7A8882]">Ready when you are</span>
          )}
        </div>

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 md:px-10">
          {isLoadingHistory ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#1F6A4F]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Card className="max-w-md border-[#DFE7E2] bg-[#F8FAF8] py-2 text-center">
                <CardContent className="px-6 py-6">
                  <CardTitle className="text-xl font-medium tracking-tight text-[#18211E]">
                    Welcome to 0xMem
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm text-[#62706A]">
                    A calm workspace for thoughtful research, writing, and assistance.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-1 pb-8 pt-7">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3 px-2 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#1F6A4F] text-sm font-semibold text-white">
                    0x
                  </div>
                  <div className="flex items-center gap-2 text-[15px] text-[#62706A]">
                    <Loader2 className="h-4 w-4 animate-spin text-[#1F6A4F]" />
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-[#E2E8E4] bg-[#FAFCFB] px-6 pb-5 pt-4 md:px-10">
          <div className="relative mx-auto max-w-4xl">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask 0xMem anything…"
              rows={1}
              className={cn(
                "max-h-40 w-full resize-none rounded-xl border border-[#D7E3DC] bg-white px-4 py-3 pr-12 text-[15px] font-normal text-[#1A2521] placeholder:text-[#70807A]",
                "shadow-[0_8px_24px_-20px_rgba(16,44,33,0.75)]",
              )}
              style={{
                height: "auto",
                minHeight: "52px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
              }}
            />
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!input.trim() || isLoading}
              size="icon"
              className={cn(
                "absolute bottom-2 right-2 h-10 w-10 rounded-[10px] transition-colors",
                input.trim() && !isLoading
                  ? "bg-[#1F6A4F] text-white hover:bg-[#18543F] active:bg-[#134231]"
                  : "bg-[#EEF2EF] text-[#7C8A84]",
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
