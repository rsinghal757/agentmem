import { NextResponse } from "next/server";
import { buildVaultGraph } from "@/lib/vault/graph";
import { getUserId } from "@/lib/utils";

/** GET /api/vault/graph — Return D3-compatible graph data */
export async function GET() {
  const userId = getUserId();

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
