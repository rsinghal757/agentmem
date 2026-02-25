import { NoteViewer } from "@/components/vault/NoteViewer";

interface NotePageProps {
  params: Promise<{ path: string[] }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const { path } = await params;
  const fullPath = path.join("/");

  // Ensure .md extension
  const notePath = fullPath.endsWith(".md") ? fullPath : `${fullPath}.md`;

  return (
    <div className="h-full overflow-y-auto bg-[#F7F8F6]">
      <NoteViewer path={notePath} />
    </div>
  );
}
