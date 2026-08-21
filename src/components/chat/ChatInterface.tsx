"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useCallback } from "react";
import { Message } from "./Message";
import {
  ArrowUp,
  Loader2,
  Trash2,
  MessageSquarePlus,
  PanelLeft,
  X,
  Sparkles,
  Network,
  FileText,
} from "lucide-react";
import { cn, DEFAULT_THREAD_ID, displayThreadTitle, formatRelativeTime } from "@/lib/utils";
import { WorkspaceIdentity } from "@/components/brand/WorkspaceIdentity";
import { SidebarTabs } from "@/components/layout/BottomTabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
    {
      icon: FileText,
      title: "Summarize notes",
      prompt: "Summarize my latest notes and pull out open questions.",
      wash: "var(--wash-sand)",
    },
    {
      icon: Network,
      title: "Find connections",
      prompt: "Find connections between my current projects and saved research.",
      wash: "var(--wash-lilac)",
    },
    {
      icon: Sparkles,
      title: "Draft from vault",
      prompt: "Draft a concise brief using what you know from my vault.",
      wash: "var(--wash-sage)",
    },
  ];

  return (
    <div className="app-shell">
      {isHistoryOpen && (
        <button
          type="button"
          aria-label="Close chat history"
          onClick={() => setIsHistoryOpen(false)}
          className="absolute inset-0 z-20 bg-foreground/15 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={cn(
          "workspace-sidebar",
          isHistoryOpen ? "translate-x-0" : "-translate-x-[112%] lg:translate-x-0",
        )}
      >
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <p className="font-display text-lg tracking-[-0.03em] text-[var(--text-strong)]">Conversations</p>
          <Button type="button" onClick={() => setIsHistoryOpen(false)} variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Close chat history">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <WorkspaceIdentity />

        <Button onClick={createNewThread} className="mb-4 h-10 w-full justify-center rounded-full">
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </Button>

        <SidebarTabs />

        <p className="mb-2 px-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Recent
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-1">
            {threads.map((thread) => (
              <Button
                type="button"
                variant="ghost"
                key={thread.id}
                onClick={() => { setActiveThreadId(thread.id); setIsHistoryOpen(false); }}
                className={cn(
                  "h-auto w-full justify-start whitespace-normal rounded-2xl border px-3 py-2.5 text-left shadow-none",
                  thread.id === activeThreadId
                    ? "border-transparent bg-[var(--wash-sage)] hover:bg-[var(--wash-sage)]"
                    : "border-transparent text-foreground hover:bg-card/80",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="truncate text-sm font-medium text-[var(--text-strong)]">
                      {displayThreadTitle(thread.title)}
                    </div>
                    {formatRelativeTime(thread.updatedAt) && (
                      <span className="shrink-0 text-[0.65rem] font-normal text-muted-foreground">
                        {formatRelativeTime(thread.updatedAt)}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-[0.72rem] font-normal text-muted-foreground">
                    {thread.preview || "Waiting to begin"}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </aside>

      <div className="workspace-panel flex h-full flex-col overflow-hidden">
        <div className="workspace-header">
          <div className="flex min-w-0 items-center gap-3">
            <Button type="button" onClick={() => setIsHistoryOpen(true)} variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-full bg-card/80 lg:hidden" aria-label="Open history">
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="display-title truncate text-[1.45rem] text-[var(--text-strong)] sm:text-[1.7rem]">
                {displayThreadTitle(activeThread?.title)}
              </h1>
              <p className="hidden text-[0.8rem] text-muted-foreground sm:block">
                A calm studio for research, synthesis, and vault-aware writing.
              </p>
            </div>
          </div>

          {messages.length > 0 ? (
            <Button onClick={clearThread} variant="ghost" size="sm" className="shrink-0 gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Trash2 className="h-3 w-3" />
              Clear thread
            </Button>
          ) : (
            <Badge variant="secondary" className="hidden bg-[var(--wash-sage)] px-3 py-1 text-primary sm:inline-flex">
              Ready
            </Badge>
          )}
        </div>

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12">
          {isLoadingHistory ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center py-8 sm:py-12">
              <div className="w-full max-w-[46rem] text-center sm:text-left">
                <div className="brand-pill mx-auto sm:mx-0">
                  <Sparkles className="h-3.5 w-3.5" />
                  Vault-aware assistant
                </div>
                <h2 className="display-title mx-auto mt-5 max-w-lg text-[2rem] leading-[1.12] text-[var(--text-strong)] sm:mx-0 sm:text-[2.35rem]">
                  Turn a scattered thought into connected knowledge.
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mx-0">
                  Ask a question, develop an argument, or synthesize your notes. GizzNote can read and tend the markdown vault as it works.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {starterPrompts.map(({ icon: Icon, title, prompt, wash }) => (
                    <Button
                      key={title}
                      type="button"
                      variant="ghost"
                      onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                      className="h-auto min-h-32 items-start justify-start whitespace-normal rounded-[1.4rem] border border-[var(--border-subtle)] p-4 text-left shadow-[var(--shadow-control)] hover:-translate-y-0.5"
                      style={{ background: wash }}
                    >
                      <span className="block">
                        <Icon className="h-4 w-4 text-primary" strokeWidth={1.6} />
                        <span className="display-title mt-3 block text-[1.2rem] leading-tight text-[var(--text-strong)]">{title}</span>
                        <span className="mt-1.5 block text-xs font-normal leading-relaxed text-muted-foreground">{prompt}</span>
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-[46rem] space-y-1 pb-10 pt-4">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex px-1 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span className="font-display italic">Considering…</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-2 sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-[var(--background)] to-transparent" />
          <div className="relative mx-auto max-w-[46rem] rounded-[1.7rem] border border-[var(--border-subtle)] bg-card/90 px-3 py-2 shadow-[var(--shadow-composer)] backdrop-blur-xl">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write, or ask GizzNote anything…"
              rows={1}
              className="max-h-40 w-full resize-none rounded-[1.2rem] border-0 bg-transparent px-3 py-3 pr-14 text-[15px] font-normal text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-0"
              style={{
                height: "auto",
                minHeight: "48px",
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
                "absolute bottom-2.5 right-2.5 h-10 w-10 rounded-full transition-colors",
                input.trim() && !isLoading
                  ? "bg-primary text-primary-foreground hover:bg-[var(--brand-hover)] active:bg-[var(--brand-active)]"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mx-auto mt-2 hidden max-w-[46rem] text-center text-[0.68rem] text-muted-foreground sm:block">
            Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </div>
    </div>
  );
}
