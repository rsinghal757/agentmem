import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { chatMessages, chatThreads } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { scopeThreadId } from "@/lib/utils";

function previewFromContent(content: string) {
  return content.trim().slice(0, 120);
}

async function ensureThread(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  userId: string,
  threadId: string,
) {
  await db
    .insert(chatThreads)
    .values({
      id: threadId,
      userId,
      title: "New chat",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();
}

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ messages: [] });
  }

  const { searchParams } = new URL(request.url);
  const threadId = scopeThreadId(userId, searchParams.get("threadId"));

  await ensureThread(db, userId, threadId);

  const messages = await db
    .select({
      id: chatMessages.id,
      messageUuid: chatMessages.messageUuid,
      threadId: chatMessages.threadId,
      role: chatMessages.role,
      content: chatMessages.content,
      parts: chatMessages.parts,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(
      and(eq(chatMessages.userId, userId), eq(chatMessages.threadId, threadId)),
    )
    .orderBy(asc(chatMessages.createdAt))
    .limit(300);

  return NextResponse.json({ messages, threadId });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { messages, threadId } = await request.json();
  const resolvedThreadId = scopeThreadId(userId, threadId);

  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  await ensureThread(db, userId, resolvedThreadId);

  let latestPreview = "";
  for (const msg of messages) {
    if (msg.role && msg.messageUuid && (msg.content || msg.parts)) {
      await db
        .insert(chatMessages)
        .values({
          userId,
          threadId: resolvedThreadId,
          messageUuid: String(msg.messageUuid),
          role: msg.role,
          content: msg.content,
          parts:
            typeof msg.parts === "string"
              ? msg.parts
              : msg.parts
                ? JSON.stringify(msg.parts)
                : null,
          createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        })
        .onConflictDoUpdate({
          target: [chatMessages.userId, chatMessages.threadId, chatMessages.messageUuid],
          set: {
            role: msg.role,
            content: msg.content,
            parts:
              typeof msg.parts === "string"
                ? msg.parts
                : msg.parts
                  ? JSON.stringify(msg.parts)
                  : null,
            // Preserve original createdAt so chronological ordering stays stable across retries/updates.
            createdAt: chatMessages.createdAt,
          },
        });
      latestPreview = previewFromContent(msg.content);
    }
  }

  await db
    .update(chatThreads)
    .set({
      preview: latestPreview || undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(chatThreads.id, resolvedThreadId), eq(chatThreads.userId, userId)));

  return NextResponse.json({ success: true, threadId: resolvedThreadId });
}

export async function DELETE(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const threadId = scopeThreadId(userId, searchParams.get("threadId"));

  await db
    .delete(chatMessages)
    .where(and(eq(chatMessages.userId, userId), eq(chatMessages.threadId, threadId)));

  await db
    .update(chatThreads)
    .set({ preview: null, updatedAt: new Date() })
    .where(and(eq(chatThreads.id, threadId), eq(chatThreads.userId, userId)));

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { threadId, title } = await request.json();
  const resolvedThreadId = scopeThreadId(userId, threadId);

  await ensureThread(db, userId, resolvedThreadId);

  await db
    .update(chatThreads)
    .set({ title: title || "New chat", updatedAt: new Date() })
    .where(and(eq(chatThreads.id, resolvedThreadId), eq(chatThreads.userId, userId)));

  return NextResponse.json({ success: true });
}
