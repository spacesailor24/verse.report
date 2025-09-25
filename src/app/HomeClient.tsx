"use client";

import { useState, useEffect } from "react";
import MainContentClient from "./MainContentClient";

interface HomeClientProps {
  sharedTransmissionId?: string | null;
}

export default function HomeClient({ sharedTransmissionId }: HomeClientProps) {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  // Set up global function for Timeline to communicate year changes
  useEffect(() => {
    (window as any).handleYearChange = (year: number) => {
      setSelectedYear(year);
    };

    return () => {
      delete (window as any).handleYearChange;
    };
  }, []);

  return <MainContentClient selectedYear={selectedYear} sharedTransmissionId={sharedTransmissionId} />;
}