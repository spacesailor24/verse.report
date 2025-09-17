"use client";

import { useState, useEffect } from "react";
import TransmissionListClient from "@/components/TransmissionList/TransmissionListClient";

export default function MainContentClient() {
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | null>(null);
  const [transmissions, setTransmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial transmissions (most recent 20 items)
  useEffect(() => {
    const loadInitialTransmissions = async () => {
      try {
        const response = await fetch('/api/transmissions');
        const data = await response.json();
        setTransmissions(data.transmissions || []);
      } catch (error) {
        console.error('Error fetching initial transmissions:', error);
        setTransmissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialTransmissions();
  }, []);

  const handleDateChange = async (year?: number, month?: number, day?: number) => {
    if (year !== undefined && month !== undefined && day !== undefined) {
      const newSelectedDate = { year, month, day };
      setSelectedDate(newSelectedDate);
      setLoading(true);

      try {
        // Fetch transmissions for the selected date
        const response = await fetch(`/api/transmissions?year=${year}&month=${month}&day=${day}`);
        const data = await response.json();
        setTransmissions(data.transmissions || []);
      } catch (error) {
        console.error('Error fetching transmissions:', error);
        setTransmissions([]);
      } finally {
        setLoading(false);
      }
    } else {
      // Load all recent transmissions when no specific date is selected
      setSelectedDate(null);
      setLoading(true);
      try {
        const response = await fetch('/api/transmissions');
        const data = await response.json();
        setTransmissions(data.transmissions || []);
      } catch (error) {
        console.error('Error fetching transmissions:', error);
        setTransmissions([]);
      } finally {
        setLoading(false);
      }
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
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div style={{ color: 'var(--color-nasa)' }}>Loading transmissions...</div>
        </div>
      ) : (
        <TransmissionListClient
          transmissions={transmissions}
          selectedDate={selectedDate || undefined}
        />
      )}
    </main>
  );
}