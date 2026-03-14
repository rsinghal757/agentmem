import { VaultSidebar } from "@/components/layout/VaultSidebar";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-full max-w-[1600px] gap-3 bg-transparent px-4 pb-4 pt-3">
      <VaultSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#DCE5DF] bg-white/80 shadow-[0_25px_65px_-48px_rgba(10,32,22,0.65)] backdrop-blur-md">
        {children}
      </div>
    </div>
  );
}
