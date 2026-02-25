import { NextResponse } from "next/server";
import { vaultSearch } from "@/lib/vault/search";
import { getUserId } from "@/lib/utils";

/** GET /api/vault/search?q=query&mode=fulltext&limit=5 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const mode = (searchParams.get("mode") || "fulltext") as
    | "fulltext"
    | "semantic";
  const limit = parseInt(searchParams.get("limit") || "5", 10);
  const userId = getUserId();

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 },
    );
  }

  try {
    const results = await vaultSearch(userId, query, mode, limit);
    return NextResponse.json({ results, count: results.length });
  } catch (error) {
    console.error("[Vault Search] Error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 },
    );
  }
}
