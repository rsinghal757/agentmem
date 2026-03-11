import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { chatMessages, chatThreads } from "@/db/schema";
import { getUserId, scopeThreadId } from "@/lib/utils";

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ threads: [] });
  }

  const userId = getUserId();
  const threads = await db
    .select({
      id: chatThreads.id,
      title: chatThreads.title,
      preview: chatThreads.preview,
      updatedAt: chatThreads.updatedAt,
      createdAt: chatThreads.createdAt,
    })
    .from(chatThreads)
    .where(eq(chatThreads.userId, userId))
    .orderBy(desc(chatThreads.updatedAt));

  return NextResponse.json({ threads });
}

export async function POST(request: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const userId = getUserId();
  const { threadId, title } = await request.json();
  const resolvedThreadId = scopeThreadId(userId, threadId || crypto.randomUUID());

  await db
    .insert(chatThreads)
    .values({
      id: resolvedThreadId,
      userId,
      title: title || "New chat",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  return NextResponse.json({
    thread: {
      id: resolvedThreadId,
      title: title || "New chat",
    },
  });
}

export async function PATCH(request: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const userId = getUserId();
  const { threadId, title } = await request.json();
  const resolvedThreadId = scopeThreadId(userId, threadId);

  await db
    .update(chatThreads)
    .set({ title: title || "New chat", updatedAt: new Date() })
    .where(and(eq(chatThreads.id, resolvedThreadId), eq(chatThreads.userId, userId)));

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const userId = getUserId();
  const { threadId } = await request.json();
  const resolvedThreadId = scopeThreadId(userId, threadId);

  await db
    .delete(chatMessages)
    .where(and(eq(chatMessages.userId, userId), eq(chatMessages.threadId, resolvedThreadId)));

  await db
    .delete(chatThreads)
    .where(and(eq(chatThreads.userId, userId), eq(chatThreads.id, resolvedThreadId)));

  return NextResponse.json({ success: true });
}
