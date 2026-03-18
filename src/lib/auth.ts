import { auth } from "@clerk/nextjs/server";
import { and, eq, ne, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { chatMessages, chatThreads, vaultNotes } from "@/db/schema";

const migratedUsers = new Set<string>();

function getLegacyUserId() {
  return process.env.DEFAULT_USER_ID || "local-dev-user";
}

async function hasAnyRowsForUser(
  userId: string,
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(chatThreads)
    .where(eq(chatThreads.userId, userId));

  if (Number(count) > 0) return true;

  const [{ messageCount }] = await db
    .select({ messageCount: sql<number>`count(*)` })
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId));

  if (Number(messageCount) > 0) return true;

  const [{ noteCount }] = await db
    .select({ noteCount: sql<number>`count(*)` })
    .from(vaultNotes)
    .where(eq(vaultNotes.userId, userId));

  return Number(noteCount) > 0;
}

async function migrateLegacyUserData(targetUserId: string) {
  const legacyUserId = getLegacyUserId();

  if (targetUserId === legacyUserId || migratedUsers.has(targetUserId)) {
    return;
  }

  const db = await getDb();
  if (!db) return;

  const [targetHasData, legacyHasData] = await Promise.all([
    hasAnyRowsForUser(targetUserId, db),
    hasAnyRowsForUser(legacyUserId, db),
  ]);

  if (targetHasData || !legacyHasData) {
    migratedUsers.add(targetUserId);
    return;
  }

  const legacyDefaultThreadId = `${legacyUserId}:default`;
  const targetDefaultThreadId = `${targetUserId}:default`;

  await db.transaction(async (tx) => {
    await tx
      .update(chatThreads)
      .set({ id: targetDefaultThreadId, userId: targetUserId, updatedAt: new Date() })
      .where(
        and(
          eq(chatThreads.userId, legacyUserId),
          eq(chatThreads.id, legacyDefaultThreadId),
        ),
      );

    await tx
      .update(chatThreads)
      .set({ userId: targetUserId, updatedAt: new Date() })
      .where(
        and(
          eq(chatThreads.userId, legacyUserId),
          ne(chatThreads.id, targetDefaultThreadId),
        ),
      );

    await tx
      .update(chatMessages)
      .set({ threadId: targetDefaultThreadId })
      .where(
        and(
          eq(chatMessages.userId, legacyUserId),
          eq(chatMessages.threadId, legacyDefaultThreadId),
        ),
      );

    await tx
      .update(chatMessages)
      .set({ userId: targetUserId })
      .where(eq(chatMessages.userId, legacyUserId));

    await tx
      .update(vaultNotes)
      .set({ userId: targetUserId, updatedAt: new Date() })
      .where(eq(vaultNotes.userId, legacyUserId));
  });

  migratedUsers.add(targetUserId);
}

export async function requireUserId() {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return null;
  }

  await migrateLegacyUserData(userId);
  return userId;
}
