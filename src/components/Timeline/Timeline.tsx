import TimelineClient from "./TimelineClient";

interface TimelineProps {
  onYearChange?: (year: number) => void;
  onMonthChange?: (month: number) => void;
  onDayChange?: (day: number) => void;
}

export default async function Timeline({
  onYearChange,
  onMonthChange,
  onDayChange,
}: TimelineProps) {
  // Server-side logic could go here (e.g., fetching available dates from database)
  // For now, we'll just pass through to the client component

  return (
    <TimelineClient
      onYearChange={onYearChange}
      onMonthChange={onMonthChange}
      onDayChange={onDayChange}
    />
  );
}