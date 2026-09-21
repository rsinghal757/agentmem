import { NoteDocument } from "@/components/vault/NoteDocument";

interface NotePageProps {
  params: Promise<{ path: string[] }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const { path } = await params;
  const fullPath = path.join("/");
  const notePath = fullPath.endsWith(".md") ? fullPath : `${fullPath}.md`;

  return <NoteDocument key={notePath} path={notePath} />;
}
