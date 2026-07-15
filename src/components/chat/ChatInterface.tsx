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
  Orbit,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { cn, DEFAULT_THREAD_ID } from "@/lib/utils";
import { SidebarTabs } from "@/components/layout/BottomTabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
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
    { icon: FileText, title: "Summarize notes", prompt: "Summarize my latest notes and pull out open questions." },
    { icon: Network, title: "Find connections", prompt: "Find connections between my current projects and saved research." },
    { icon: Sparkles, title: "Draft from vault", prompt: "Draft a concise brief using what you know from my vault." },
  ];

  return (
    <div className="app-shell">
      {isHistoryOpen && (
        <button
          type="button"
          aria-label="Close chat history"
          onClick={() => setIsHistoryOpen(false)}
          className="absolute inset-0 z-20 bg-foreground/20 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={cn(
          "workspace-sidebar",
          isHistoryOpen ? "translate-x-0" : "-translate-x-[112%] lg:translate-x-0",
        )}
      >
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <p className="text-sm font-semibold text-[var(--text-strong)]">Conversations</p>
          <Button type="button" onClick={() => setIsHistoryOpen(false)} variant="ghost" size="icon" className="h-8 w-8" aria-label="Close chat history">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Card className="mb-3 border-border/80 bg-card/80 shadow-none">
          <CardContent className="flex items-start justify-between gap-3 p-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.7rem] bg-primary text-primary-foreground shadow-[var(--shadow-control)]">
                <Orbit className="h-[1.1rem] w-[1.1rem]" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-base font-semibold tracking-[-0.025em] text-[var(--text-strong)]">GizzNote</div>
                <p className="truncate text-[0.7rem] text-muted-foreground">Notes that think with you</p>
              </div>
            </div>
            <SignedIn><UserButton /></SignedIn>
            <SignedOut><SignInButton><Button variant="outline" size="sm">Sign in</Button></SignInButton></SignedOut>
          </CardContent>
        </Card>

        <Button onClick={createNewThread} variant="outline" className="mb-3 w-full justify-center bg-card">
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </Button>

        <SidebarTabs />

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            {threads.map((thread) => (
              <Button
                type="button"
                variant="ghost"
                key={thread.id}
                onClick={() => { setActiveThreadId(thread.id); setIsHistoryOpen(false); }}
                className={cn(
                  "h-auto w-full justify-start whitespace-normal rounded-[0.7rem] border px-3 py-2.5 text-left shadow-none",
                  thread.id === activeThreadId
                    ? "border-[color-mix(in_oklab,var(--brand),white_76%)] bg-[var(--brand-softer)] hover:bg-[var(--brand-softer)]"
                    : "border-transparent text-foreground hover:border-border hover:bg-card",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-[var(--text-strong)]">{thread.title || "New chat"}</div>
                  <div className="mt-0.5 truncate text-[0.72rem] font-normal text-muted-foreground">{thread.preview || "No messages yet"}</div>
                </div>
              </Button>
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
            <Badge variant="secondary" className="hidden px-2.5 text-primary sm:inline-flex">Ready</Badge>
          )}
        </div>

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-10">
          {isLoadingHistory ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center py-8 sm:py-12">
              <Card className="w-full max-w-[44rem] border-border/80 bg-card/95 shadow-[var(--shadow-panel)]">
                <CardContent className="px-5 py-6 sm:px-8 sm:py-8">
                  <div className="brand-pill"><Sparkles className="h-3.5 w-3.5" />Vault-aware assistant</div>
                  <CardTitle className="mt-4 max-w-lg text-2xl font-semibold tracking-[-0.035em] text-[var(--text-strong)] sm:text-[1.75rem]">Turn a scattered thought into connected knowledge.</CardTitle>
                  <CardDescription className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Ask a question, develop an argument, or synthesize your notes. GizzNote can read and maintain the markdown vault as it works.</CardDescription>
                  <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
                    {starterPrompts.map(({ icon: Icon, title, prompt }) => (
                      <Button key={title} type="button" variant="outline" onClick={() => { setInput(prompt); inputRef.current?.focus(); }} className="h-auto min-h-28 items-start justify-start whitespace-normal border-border/80 bg-background/60 p-3.5 text-left shadow-none hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--brand),white_68%)] hover:bg-[var(--brand-softer)]">
                        <span className="block">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="mt-2 block text-sm font-semibold text-[var(--text-strong)]">{title}</span>
                          <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">{prompt}</span>
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-[58rem] space-y-1 pb-8 pt-6">
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

        <div className="border-t border-[var(--border-subtle)] bg-card/80 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-3 backdrop-blur-xl sm:px-6 lg:px-10">
          <div className="relative mx-auto max-w-[58rem]">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask GizzNote anything…"
              rows={1}
              className={cn(
                "max-h-40 w-full resize-none rounded-xl border border-input bg-card px-4 py-3 pr-14 text-[15px] font-normal text-foreground placeholder:text-muted-foreground",
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
                "absolute bottom-2 right-2 h-9 w-9 rounded-lg transition-colors",
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
          <p className="mx-auto mt-1.5 hidden max-w-[58rem] text-center text-[0.68rem] text-muted-foreground sm:block">Enter to send · Shift + Enter for a new line</p>
        </div>
      </div>
    </div>
  );
}
