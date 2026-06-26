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
  Sparkles,
  Network,
  FileText,
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
    void Promise.resolve().then(() => {
      loadThreads().catch((e) => console.error("Failed to load threads", e));
    });
  }, [loadThreads]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      loadHistory(activeThreadId).catch((e) => console.error("Failed to load history", e));
    });
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

  const activeThread = threads.find((thread) => thread.id === activeThreadId);
  const starterPrompts = [
    { icon: FileText, title: "Summarize notes", prompt: "Summarize my latest notes and pull out open questions." },
    { icon: Network, title: "Find connections", prompt: "Find connections between my current projects and saved research." },
    { icon: Sparkles, title: "Draft from memory", prompt: "Draft a concise brief using what you know from my vault." },
  ];

  return (
    <div className="app-shell">
      {isHistoryOpen && (
        <button
          type="button"
          aria-label="Close chat history"
          onClick={() => setIsHistoryOpen(false)}
          className="absolute inset-0 z-20 bg-black/25 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "workspace-sidebar",
          isHistoryOpen ? "translate-x-0" : "-translate-x-[112%] lg:translate-x-0",
        )}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <p className="text-sm font-semibold text-[var(--text-strong)]">Conversations</p>
          <button type="button" onClick={() => setIsHistoryOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Close chat history">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 rounded-2xl border border-[var(--border-subtle)] bg-[linear-gradient(135deg,var(--brand-softer),rgba(255,255,255,0.82))] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">Workspace</div>
              <div className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-strong)]">0xMem</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Research memory, notes, and graph.</p>
            </div>
            <SignedIn><UserButton /></SignedIn>
            <SignedOut><SignInButton><button className="rounded-lg border border-[var(--border-soft)] bg-white px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent">Sign in</button></SignInButton></SignedOut>
          </div>
        </div>

        <Button onClick={createNewThread} variant="outline" className="mb-3 w-full justify-center rounded-xl bg-white/70">
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </Button>

        <SidebarTabs />

        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recent threads</div>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => { setActiveThreadId(thread.id); setIsHistoryOpen(false); }}
                className={cn(
                  "w-full rounded-2xl px-3 py-2.5 text-left transition-[background-color,border-color,box-shadow]",
                  thread.id === activeThreadId
                    ? "border border-[color-mix(in_oklab,var(--brand),white_70%)] bg-[var(--brand-softer)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]"
                    : "border border-transparent hover:border-[var(--border-subtle)] hover:bg-white/70",
                )}
              >
                <div className="truncate text-sm font-medium text-[var(--text-strong)]">{thread.title || "New chat"}</div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{thread.preview || "No messages yet"}</div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="workspace-panel flex h-full flex-col overflow-hidden">
        <div className="workspace-header">
          <div className="flex min-w-0 items-center gap-3">
            <Button type="button" onClick={() => setIsHistoryOpen(true)} variant="outline" size="icon" className="h-9 w-9 shrink-0 bg-white/80 lg:hidden" aria-label="Open history">
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">Chat</div>
              <h1 className="truncate text-base font-semibold tracking-tight text-[var(--text-strong)] sm:text-lg">{activeThread?.title || "New chat"}</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">Calm workspace for research, synthesis, and vault-aware writing.</p>
            </div>
          </div>

          {messages.length > 0 ? (
            <Button onClick={clearThread} variant="ghost" size="sm" className="shrink-0 gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Trash2 className="h-3 w-3" />
              Clear thread
            </Button>
          ) : (
            <span className="hidden rounded-full bg-[var(--brand-softer)] px-3 py-1 text-xs font-medium text-[var(--brand)] sm:inline-flex">Ready</span>
          )}
        </div>

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-10">
          {isLoadingHistory ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4">
              <Card className="max-w-2xl border-[var(--border-soft)] bg-[var(--surface-raised)] text-center shadow-[var(--shadow-raised)]">
                <CardContent className="px-5 py-7 sm:px-8">
                  <div className="brand-pill mx-auto"><Sparkles className="h-3.5 w-3.5" />Start with memory</div>
                  <CardTitle className="mt-4 text-2xl font-semibold tracking-tight text-[var(--text-strong)]">Welcome to 0xMem</CardTitle>
                  <CardDescription className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">Ask questions, shape notes, and let your research workspace surface useful context.</CardDescription>
                  <div className="mt-6 grid gap-2 sm:grid-cols-3">
                    {starterPrompts.map(({ icon: Icon, title, prompt }) => (
                      <button key={title} type="button" onClick={() => setInput(prompt)} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--brand-softer)] p-3 text-left hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--brand),white_65%)] hover:bg-white">
                        <Icon className="h-4 w-4 text-primary" />
                        <div className="mt-2 text-sm font-semibold text-[var(--text-strong)]">{title}</div>
                        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{prompt}</div>
                      </button>
                    ))}
                  </div>
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
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                    0x
                  </div>
                  <div className="flex items-center gap-2 text-[15px] text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.42),var(--brand-softer))] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-4 sm:px-6 lg:px-10">
          <div className="relative mx-auto max-w-4xl">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask 0xMem anything…"
              rows={1}
              className={cn(
                "max-h-40 w-full resize-none rounded-2xl border border-[var(--border-soft)] bg-white/92 px-4 py-3 pr-14 text-[15px] font-normal text-foreground placeholder:text-muted-foreground focus-visible:border-[color-mix(in_oklab,var(--brand),white_50%)] focus-visible:ring-[var(--focus-ring)]",
                "shadow-[0_16px_44px_-34px_rgba(16,44,33,0.75)]",
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
                  ? "bg-primary text-primary-foreground hover:bg-[var(--brand-hover)] active:bg-[var(--brand-active)]"
                  : "bg-muted text-muted-foreground",
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
      </div>
    </div>
  );
}
