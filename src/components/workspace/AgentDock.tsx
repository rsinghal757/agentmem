"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  FileText,
  History,
  Loader2,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { Message } from "@/components/chat/Message";
import { Button } from "@/components/ui/button";
import { cn, DEFAULT_THREAD_ID } from "@/lib/utils";
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

const OPENERS = [
  "Pull the open questions out of my recent notes.",
  "Where does this idea already appear in my vault?",
  "Draft a short note from what we just worked through.",
];

export function AgentDock({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [activeThreadId, setActiveThreadId] = useState(DEFAULT_THREAD_ID);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [input, setInput] = useState("");

  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ threadId: activeThreadId }),
    }),
  });

  const streamRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const persistedSnapshots = useRef<PersistedMessageSnapshot>(new Map());

  const isLoading = status === "streaming" || status === "submitted";

  const openNote = useMemo(() => {
    if (!pathname.startsWith("/vault/") || pathname === "/vault/graph") return null;
    const path = decodeURIComponent(pathname.slice("/vault/".length));
    return { path, name: path.split("/").pop()?.replace(/\.md$/, "") || path };
  }, [pathname]);

  const loadThreads = useCallback(async () => {
    const res = await fetch("/api/chat/threads");
    const data = await res.json();
    const loaded = (data.threads || []) as ThreadSummary[];

    if (loaded.length === 0) {
      const createRes = await fetch("/api/chat/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: DEFAULT_THREAD_ID, title: "New conversation" }),
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
    if (!loaded.find((thread) => thread.id === activeThreadId)) {
      setActiveThreadId(loaded[0].id);
    }
  }, [activeThreadId]);

  const loadHistory = useCallback(
    async (threadId: string) => {
      setIsLoadingHistory(true);
      try {
        const res = await fetch(
          `/api/chat/history?threadId=${encodeURIComponent(threadId)}`,
        );
        const data = await res.json();
        const loadedMessages = mapPersistedRowsToUIMessages(
          (data.messages || []) as PersistedHistoryMessageRow[],
        );
        setMessages(loadedMessages);
        persistedSnapshots.current = new Map(
          loadedMessages.map((message) => [
            message.id,
            getHistoryMessageSignature(message),
          ]),
        );
      } catch (e) {
        console.error("Failed to load chat history:", e);
        setMessages([]);
        persistedSnapshots.current = new Map();
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [setMessages],
  );

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

  useEffect(() => {
    const container = streamRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function clearThread() {
    await fetch(`/api/chat/history?threadId=${encodeURIComponent(activeThreadId)}`, {
      method: "DELETE",
    });
    setMessages([]);
    persistedSnapshots.current = new Map();
    await loadThreads();
  }

  async function startThread() {
    const res = await fetch("/api/chat/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId: crypto.randomUUID(),
        title: "New conversation",
      }),
    });
    const data = await res.json();
    setActiveThreadId(data.thread.id);
    setIsHistoryOpen(false);
    await loadThreads();
    inputRef.current?.focus();
  }

  function submit() {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    sendMessage({ text });
  }

  const activeThread = threads.find((thread) => thread.id === activeThreadId);
  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <header className="flex h-[var(--topbar-height)] shrink-0 items-center gap-2 border-b border-border px-2.5">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-none text-[var(--text-strong)]">
            Agent
          </div>
          <div className="mt-1 truncate text-[11px] leading-none text-[var(--text-faint)]">
            {activeThread?.title || "New conversation"}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          data-active={isHistoryOpen}
          aria-label="Conversation history"
          title="Conversation history"
          className={cn(isHistoryOpen && "bg-[var(--surface-active)] text-[var(--text-strong)]")}
        >
          <History className="h-4 w-4" strokeWidth={1.5} />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={startThread}
          aria-label="New conversation"
          title="New conversation"
        >
          <SquarePen className="h-4 w-4" strokeWidth={1.5} />
        </Button>

        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close agent"
            className="xl:hidden"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        ) : null}
      </header>

      {isHistoryOpen ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <div className="eyebrow px-1 pb-2 pt-1">Conversations</div>
          <div className="space-y-px">
            {threads.map((thread) => {
              const isActive = thread.id === activeThreadId;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setIsHistoryOpen(false);
                  }}
                  className={cn(
                    "sq-control flex w-full items-start gap-2 px-2 py-1.5 text-left outline-none",
                    isActive
                      ? "bg-[var(--brand-tint)]"
                      : "hover:bg-[var(--surface-hover)]",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[13px]",
                        isActive
                          ? "font-medium text-[var(--brand-deep)]"
                          : "text-[var(--text-strong)]",
                      )}
                    >
                      {thread.title || "New conversation"}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-[var(--text-faint)]">
                      {thread.preview || "Nothing said yet"}
                    </span>
                  </span>
                  {isActive ? (
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--brand-deep)]"
                      strokeWidth={2}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div ref={streamRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
          {isLoadingHistory ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--text-faint)]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="pt-1">
              <p className="text-[13px] leading-relaxed text-[var(--text-muted)]">
                The agent reads and writes the same markdown files you do. Ask it something,
                or start here.
              </p>
              <div className="mt-3 space-y-1.5">
                {OPENERS.map((opener) => (
                  <button
                    key={opener}
                    type="button"
                    onClick={() => {
                      setInput(opener);
                      inputRef.current?.focus();
                    }}
                    className="sq-control block w-full border border-border bg-[var(--surface-sunken)] px-2.5 py-2 text-left text-[12.5px] leading-snug text-[var(--text-muted)] outline-none transition-colors hover:border-[color-mix(in_oklab,var(--brand),transparent_60%)] hover:text-[var(--text-strong)]"
                  >
                    {opener}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col pb-2">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" ? (
                <div className="flex items-center gap-2 py-2 text-[12px] text-[var(--text-faint)]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Working…
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      <div className="shrink-0 px-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.625rem)] pt-1">
        {messages.length > 0 && !isHistoryOpen ? (
          <button
            type="button"
            onClick={clearThread}
            className="mb-1.5 inline-flex items-center gap-1 text-[11px] text-[var(--text-faint)] outline-none hover:text-[var(--text-strong)]"
          >
            <Trash2 className="h-3 w-3" strokeWidth={1.5} />
            Clear this conversation
          </button>
        ) : null}

        <div className="sq-card border border-border bg-card p-2 transition-[border-color] duration-500 hover:border-[color-mix(in_oklab,var(--brand),transparent_60%)] focus-within:border-[var(--brand)]">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            onInput={(event) => {
              const target = event.currentTarget;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
            }}
            rows={2}
            placeholder="Ask about your notes, or start a draft"
            className="block max-h-40 min-h-[44px] w-full resize-none bg-transparent px-1 text-[13.5px] leading-relaxed text-[var(--text-strong)] outline-none placeholder:text-[var(--text-faint)]"
          />

          <div className="mt-1.5 flex items-center gap-2">
            {openNote ? (
              <button
                type="button"
                onClick={() => {
                  setInput((current) =>
                    `${current}${current && !current.endsWith(" ") ? " " : ""}[[${openNote.path.replace(/\.md$/, "")}]] `,
                  );
                  inputRef.current?.focus();
                }}
                title={`Mention ${openNote.path}`}
                className="sq-control inline-flex min-w-0 max-w-[62%] items-center gap-1.5 border border-border bg-[var(--surface-sunken)] px-1.5 py-1 text-[11px] text-[var(--text-muted)] outline-none hover:border-[color-mix(in_oklab,var(--brand),transparent_60%)] hover:text-[var(--text-strong)]"
              >
                <FileText className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                <span className="truncate font-mono">{openNote.name}</span>
              </button>
            ) : (
              <span className="text-[11px] text-[var(--text-faint)]">
                Enter to send · Shift + Enter for a line
              </span>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="Send"
              className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-white outline-none transition-opacity disabled:opacity-45"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.25} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
