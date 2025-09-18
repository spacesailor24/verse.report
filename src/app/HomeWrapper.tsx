import Sidebar from "@/components/Sidebar/Sidebar";
import Timeline from "@/components/Timeline/Timeline";
import HomeClient from "./HomeClient";
import { MobileMenuProvider } from "@/contexts/MobileMenuContext";

export default function HomeWrapper() {
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
          <HomeClient />
        </div>
      </div>
    </MobileMenuProvider>
  );
}