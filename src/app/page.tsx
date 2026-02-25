import { ChatInterface } from "@/components/chat/ChatInterface";
import { Sidebar } from "@/components/layout/Sidebar";

export default function Home() {
  return (
    <div className="relative flex h-full">
      {/* Main chat area */}
      <div className="flex-1">
        <ChatInterface />
      </div>

      {/* Right sidebar with vault activity */}
      <Sidebar />
    </div>
  );
}
