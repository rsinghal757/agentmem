import { NextResponse } from "next/server";
import { getAllMemories } from "@/lib/memory/mem0";
import { getUserId } from "@/lib/utils";

/** GET /api/memory — Get all memories for the current user */
export async function GET() {
  const userId = getUserId();

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
