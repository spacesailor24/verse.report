"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import Timeline from "@/components/Timeline/Timeline";
import HomeClient from "./HomeClient";
import { MobileMenuProvider } from "@/contexts/MobileMenuContext";

export default function HomeWrapper() {
  const searchParams = useSearchParams();
  const [sharedTransmissionId, setSharedTransmissionId] = useState<string | null>(null);

  useEffect(() => {
    const shared = searchParams.get('shared');
    if (shared) {
      setSharedTransmissionId(shared);

      // Remove the parameter from URL after processing to clean the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('shared');
      window.history.replaceState(null, '', url.toString());
    }
  }, [searchParams]);

  return (
    <MobileMenuProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Timeline />
          <HomeClient sharedTransmissionId={sharedTransmissionId} />
        </div>
      </div>
    </MobileMenuProvider>
  );
}