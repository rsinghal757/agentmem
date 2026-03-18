import { NextResponse } from "next/server";
import { buildVaultGraph } from "@/lib/vault/graph";
import { requireUserId } from "@/lib/auth";

/** GET /api/vault/graph — Return D3-compatible graph data */
export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const graph = await buildVaultGraph(userId);
    return NextResponse.json(graph);
  } catch (error) {
    console.error("[Vault Graph] Error:", error);
    return NextResponse.json(
      { error: "Failed to build graph" },
      { status: 500 },
    );
  }
}
