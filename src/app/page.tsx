import { ChatInterface } from "@/components/chat/ChatInterface";
import { Sidebar } from "@/components/layout/Sidebar";

export default function Home() {
  return (
    <div className="relative flex h-full rounded-2xl">
      {/* Main chat area */}
      <div className="flex-1 overflow-hidden rounded-l-2xl">
        <ChatInterface />
      </div>

      {/* Right sidebar with vault activity */}
      <Sidebar />
    </div>
  );
}
