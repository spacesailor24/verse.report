"use client";

import { useState, useEffect } from "react";
import TimelineClient from "./TimelineClient";

export default function Timeline() {
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [dateAvailability, setDateAvailability] = useState<Record<number, Record<number, Set<number>>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimelineData() {
      try {
        const response = await fetch('/api/timeline');
        if (!response.ok) throw new Error('Failed to fetch timeline data');
        const data = await response.json();

        // Convert arrays back to Sets
        const convertedDateAvailability = Object.entries(data.dateAvailability).reduce((acc, [year, months]) => {
          acc[parseInt(year)] = Object.entries(months as Record<number, number[]>).reduce((monthAcc, [month, days]) => {
            monthAcc[parseInt(month)] = new Set(days);
            return monthAcc;
          }, {} as Record<number, Set<number>>);
          return acc;
        }, {} as Record<number, Record<number, Set<number>>>);

        setAvailableYears(data.availableYears);
        setDateAvailability(convertedDateAvailability);
      } catch (error) {
        console.error('Error fetching timeline data:', error);
        setAvailableYears([]);
        setDateAvailability({});
      } finally {
        setLoading(false);
      }
    }

    fetchTimelineData();
  }, []);

  if (loading) {
    return <div style={{ visibility: 'hidden' }}>Loading timeline...</div>;
  }

  return (
    <TimelineClient
      availableYears={availableYears}
      dateAvailability={dateAvailability}
    />
  );
}