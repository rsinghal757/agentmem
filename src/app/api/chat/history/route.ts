import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { chatMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ messages: [] });
  }
  const userId = "default-user";

  const messages = await db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(100);

  return NextResponse.json({ messages: messages.reverse() });
}

export async function POST(request: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const userId = "default-user";
  const { messages } = await request.json();

  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  for (const msg of messages) {
    if (msg.role && msg.content) {
      await db.insert(chatMessages).values({
        userId,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(),
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }
  const userId = "default-user";

  await db.delete(chatMessages).where(eq(chatMessages.userId, userId));

  return NextResponse.json({ success: true });
}
