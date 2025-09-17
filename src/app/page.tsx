import Sidebar from "@/components/Sidebar/Sidebar";
import Timeline from "@/components/Timeline/Timeline";
import { MobileMenuProvider } from "@/contexts/MobileMenuContext";

export default function Home() {
  return (
    <MobileMenuProvider>
      <div className="flex h-screen">
        <div className="hidden xl:block">
          <Sidebar />
        </div>
        <div className="xl:hidden">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <Timeline />
          <main className="flex-1 p-4">
            {/* Main content area */}
          </main>
        </div>
      </div>
    </MobileMenuProvider>
  );
}
