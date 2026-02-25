import { NextResponse } from "next/server";
import { vaultStorage } from "@/lib/vault/storage";
import { parseFrontmatter, extractWikilinks, countWords } from "@/lib/vault/markdown";
import { getUserId } from "@/lib/utils";

/** GET /api/vault/files?path=&recursive=false — List vault files */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const directory = searchParams.get("path") || "";
  const recursive = searchParams.get("recursive") === "true";
  const userId = getUserId();

  try {
    const files = await vaultStorage.list(userId, directory, recursive);
    return NextResponse.json({ files, count: files.length });
  } catch (error) {
    console.error("[Vault Files] Error listing:", error);
    return NextResponse.json(
      { error: "Failed to list vault files" },
      { status: 500 },
    );
  }
}

/** POST /api/vault/files — Read a specific file */
export async function POST(request: Request) {
  const { path } = await request.json();
  const userId = getUserId();

  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  try {
    const content = await vaultStorage.read(userId, path);
    if (!content) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const frontmatter = parseFrontmatter(content);
    const wikilinks = extractWikilinks(content);
    const wordCount = countWords(content);

    return NextResponse.json({
      path,
      content,
      frontmatter,
      wikilinks,
      wordCount,
    });
  } catch (error) {
    console.error("[Vault Files] Error reading:", error);
    return NextResponse.json(
      { error: "Failed to read vault file" },
      { status: 500 },
    );
  }
}

/** PUT /api/vault/files — Write/update a file */
export async function PUT(request: Request) {
  const { path, content } = await request.json();
  const userId = getUserId();

  if (!path || !content) {
    return NextResponse.json(
      { error: "Path and content are required" },
      { status: 400 },
    );
  }

  try {
    await vaultStorage.write(userId, path, content);
    return NextResponse.json({ success: true, path });
  } catch (error) {
    console.error("[Vault Files] Error writing:", error);
    return NextResponse.json(
      { error: "Failed to write vault file" },
      { status: 500 },
    );
  }
}

/** DELETE /api/vault/files — Delete a file */
export async function DELETE(request: Request) {
  const { path } = await request.json();
  const userId = getUserId();

  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  try {
    await vaultStorage.delete(userId, path);
    return NextResponse.json({ success: true, path });
  } catch (error) {
    console.error("[Vault Files] Error deleting:", error);
    return NextResponse.json(
      { error: "Failed to delete vault file" },
      { status: 500 },
    );
  }
}
