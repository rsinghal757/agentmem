import { NextResponse } from "next/server";
import { getAllMemories } from "@/lib/memory/mem0";
import { requireUserId } from "@/lib/auth";

/** GET /api/memory — Get all memories for the current user */
export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const memories = await getAllMemories(userId);
    return NextResponse.json({ memories, count: memories.length });
  } catch (error) {
    console.error("[Memory] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve memories" },
      { status: 500 },
    );
  }
}
