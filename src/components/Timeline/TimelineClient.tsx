"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Timeline.module.css";

interface TimelineClientProps {
  onYearChange?: (year: number) => void;
  onMonthChange?: (month: number) => void;
  onDayChange?: (day: number) => void;
}

export default function TimelineClient({
  onYearChange,
  onMonthChange,
  onDayChange,
}: TimelineClientProps) {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(0); // January
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const years = [2023, 2024, 2025];
  const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setIsYearDropdownOpen(false);
    onYearChange?.(year);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsYearDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMonthChange = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setSelectedDay(null); // Reset day when month changes
    onMonthChange?.(monthIndex);
  };

  const handleDayChange = (day: number) => {
    setSelectedDay(day);
    onDayChange?.(day);
  };

  return (
    <nav className={styles.timelineNav}>
      <div className={styles.navContainer}>
        {/* Month selector row with year dropdown */}
        <div className={styles.monthRow}>
          <div className={styles.yearDropdownContainer} ref={dropdownRef}>
            <button
              className={styles.yearDropdown}
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
            >
              <span>{selectedYear}</span>
              <span className={styles.yearDropdownArrow}>
                {isYearDropdownOpen ? "▲" : "▼"}
              </span>
            </button>
            {isYearDropdownOpen && (
              <div className={styles.yearDropdownMenu}>
                {years.map((year) => (
                  <button
                    key={year}
                    className={`${styles.yearDropdownItem} ${
                      year === selectedYear ? styles.yearDropdownItemActive : ""
                    }`}
                    onClick={() => handleYearChange(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={styles.monthScroller}>
            {months.map((month, index) => (
              <button
                key={month}
                onClick={() => handleMonthChange(index)}
                className={`${styles.monthButton} ${
                  selectedMonth === index ? styles.monthButtonActive : ""
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>

        {/* Day selector row */}
        <div className={styles.dayRow}>
          <div className={styles.dayScroller}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const isValidDay = day <= daysInMonth;
              return (
                <button
                  key={day}
                  onClick={() => isValidDay && handleDayChange(day)}
                  disabled={!isValidDay}
                  className={`${styles.dayButton} ${
                    selectedDay === day ? styles.dayButtonActive : ""
                  } ${!isValidDay ? styles.dayButtonDisabled : ""}`}
                  title={
                    isValidDay
                      ? `${months[selectedMonth]} ${day}, ${selectedYear}`
                      : "Invalid date"
                  }
                >
                  {String(day).padStart(2, "0")}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
