import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { vaultNotes } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { countWords, extractBody, parseFrontmatter } from "@/lib/vault/markdown";

const EXCERPT_LENGTH = 150;

function buildExcerpt(content: string) {
  return extractBody(content)
    .replace(/^#{1,6}\s+.*$/gm, "")
    .replace(/[*_`>#[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, EXCERPT_LENGTH);
}

/** GET /api/vault/recent?limit=8 — Most recently touched notes, newest first */
export async function GET(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 8, 1), 50);

  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ notes: [] });
    }

    const rows = await db
      .select({
        path: vaultNotes.path,
        content: vaultNotes.content,
        updatedAt: vaultNotes.updatedAt,
      })
      .from(vaultNotes)
      .where(eq(vaultNotes.userId, userId))
      .orderBy(desc(vaultNotes.updatedAt))
      .limit(limit);

    return NextResponse.json({
      notes: rows.map((row) => {
        const frontmatter = parseFrontmatter(row.content);
        const fallbackTitle =
          row.path.split("/").pop()?.replace(/\.md$/, "") || row.path;

        return {
          path: row.path,
          title: frontmatter?.title || fallbackTitle,
          type: frontmatter?.type || null,
          tags: frontmatter?.tags || [],
          excerpt: buildExcerpt(row.content),
          wordCount: countWords(row.content),
          updatedAt: row.updatedAt,
        };
      }),
    });
  } catch (error) {
    console.error("[Vault Recent] Error listing:", error);
    return NextResponse.json({ error: "Failed to list recent notes" }, { status: 500 });
  }
}
