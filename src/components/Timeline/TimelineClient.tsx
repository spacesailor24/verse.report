"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Timeline.module.css";
import { useMobileMenu } from "@/contexts/MobileMenuContext";

interface TimelineClientProps {
  onYearChange?: (year: number) => void;
  onMonthChange?: (month: number) => void;
  onDayChange?: (day: number) => void;
  availableYears: number[];
  dateAvailability: Record<number, Record<number, Set<number>>>;
}

export default function TimelineClient({
  onYearChange,
  onMonthChange,
  onDayChange,
  availableYears,
  dateAvailability,
}: TimelineClientProps) {
  const { toggleMobileMenu } = useMobileMenu();
  // Find the closest available date to today
  const getClosestAvailableDate = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    // Check if today has transmissions
    if (dateAvailability[currentYear]?.[currentMonth]?.has(currentDay)) {
      return { year: currentYear, month: currentMonth, day: currentDay };
    }

    // Find all available dates and calculate distance from today
    const allDates: Array<{ year: number; month: number; day: number; distance: number }> = [];

    Object.keys(dateAvailability).forEach(yearStr => {
      const year = parseInt(yearStr);
      Object.keys(dateAvailability[year]).forEach(monthStr => {
        const month = parseInt(monthStr);
        dateAvailability[year][month].forEach(day => {
          const date = new Date(year, month, day);
          const distance = Math.abs(date.getTime() - today.getTime());
          allDates.push({ year, month, day, distance });
        });
      });
    });

    // Sort by distance and return closest
    allDates.sort((a, b) => a.distance - b.distance);

    if (allDates.length > 0) {
      return allDates[0];
    }

    // Fallback to first available date
    const firstYear = availableYears[0];
    if (firstYear && dateAvailability[firstYear]) {
      for (let month = 0; month < 12; month++) {
        if (dateAvailability[firstYear][month] && dateAvailability[firstYear][month].size > 0) {
          const firstDay = Math.min(...Array.from(dateAvailability[firstYear][month]));
          return { year: firstYear, month, day: firstDay };
        }
      }
    }

    return { year: availableYears[0] || new Date().getFullYear(), month: 0, day: null };
  };

  const closestDate = getClosestAvailableDate();
  const [selectedYear, setSelectedYear] = useState(closestDate.year);
  const [selectedMonth, setSelectedMonth] = useState(closestDate.month);
  const [selectedDay, setSelectedDay] = useState(closestDate.day);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  const getFirstAvailableMonth = (year: number) => {
    const yearData = dateAvailability[year];
    if (!yearData) return 0;

    for (let month = 0; month < 12; month++) {
      if (yearData[month] && yearData[month].size > 0) {
        return month;
      }
    }
    return 0;
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedMonth(getFirstAvailableMonth(year));
    setSelectedDay(null);
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
        {/* Month selector row with year dropdown and mobile hamburger */}
        <div className={styles.monthRow}>
          {/* Mobile hamburger button */}
          <button
            className={styles.hamburgerButton}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>

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
                {availableYears.map((year) => (
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
            {months.map((month, index) => {
              const hasTransmissions = dateAvailability[selectedYear]?.[index] &&
                                     dateAvailability[selectedYear][index].size > 0;

              return (
                <button
                  key={month}
                  onClick={() => hasTransmissions && handleMonthChange(index)}
                  disabled={!hasTransmissions}
                  className={`${styles.monthButton} ${
                    selectedMonth === index ? styles.monthButtonActive : ""
                  } ${hasTransmissions ? styles.monthButtonHasTransmissions : styles.monthButtonDisabled}`}
                  title={hasTransmissions ? `${month} - Has transmissions` : `${month} - No transmissions`}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day selector row */}
        <div className={styles.dayRow}>
          <div className={styles.dayScroller}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const isValidDay = day <= daysInMonth;
              const hasTransmissions = dateAvailability[selectedYear]?.[selectedMonth]?.has(day) || false;
              const isClickable = isValidDay && hasTransmissions;

              return (
                <button
                  key={day}
                  onClick={() => isClickable && handleDayChange(day)}
                  disabled={!isClickable}
                  className={`${styles.dayButton} ${
                    selectedDay === day ? styles.dayButtonActive : ""
                  } ${!isValidDay ? styles.dayButtonDisabled : ""} ${
                    hasTransmissions ? styles.dayButtonHasTransmissions : ""
                  }`}
                  title={
                    isClickable
                      ? `${months[selectedMonth]} ${day}, ${selectedYear} - Has transmissions`
                      : !isValidDay
                      ? "Invalid date"
                      : "No transmissions available"
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
