import Sidebar from "@/components/Sidebar/Sidebar";
import Timeline from "@/components/Timeline/Timeline";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Timeline />
        <main className="flex-1 p-4">
          {/* Main content area */}
        </main>
      </div>
    </div>
  );
}
