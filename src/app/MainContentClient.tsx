"use client";

import { useState, useEffect } from "react";
import TransmissionList from "@/components/TransmissionList/TransmissionList";

export default function MainContentClient() {
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | undefined>(undefined);

  const handleDateChange = async (year?: number, month?: number, day?: number) => {
    if (year !== undefined && month !== undefined && day !== undefined) {
      setSelectedDate({ year, month, day });
    } else {
      setSelectedDate(undefined);
    }
  };

  // Make the date change handler available globally for Timeline to use
  useEffect(() => {
    (window as any).handleTimelineChange = handleDateChange;
    return () => {
      delete (window as any).handleTimelineChange;
    };
  }, []);

  return (
    <main className="flex-1 p-4 overflow-y-auto">
      <TransmissionList selectedDate={selectedDate} />
    </main>
  );
}