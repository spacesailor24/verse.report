"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Timeline.module.css";
import { useMobileMenu } from "@/contexts/MobileMenuContext";

interface TimelineClientProps {
  availableYears: number[];
  dateAvailability: Record<number, Record<number, Set<number>>>;
}

export default function TimelineClient({
  availableYears,
  dateAvailability,
}: TimelineClientProps) {
  const { toggleMobileMenu } = useMobileMenu();
  const [currentViewDate, setCurrentViewDate] = useState<{ year: number; month: number; day: number } | null>(null);

  // Helper function to find first available month
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

  // Initialize with current year but don't auto-select specific dates
  const currentYear = new Date().getFullYear();
  const defaultYear = availableYears.includes(currentYear) ? currentYear : (availableYears[0] || currentYear);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(() => getFirstAvailableMonth(defaultYear));
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // Don't select a day by default
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

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setIsYearDropdownOpen(false);

    // Find the last available date in the selected year
    const yearData = dateAvailability[year];
    if (yearData) {
      let lastMonth = -1;
      let lastDay = -1;

      // Find the last month with transmissions (iterate backwards)
      for (let month = 11; month >= 0; month--) {
        if (yearData[month] && yearData[month].size > 0) {
          lastMonth = month;
          // Find the last day in this month
          const availableDays = Array.from(yearData[month]).sort((a, b) => b - a);
          lastDay = availableDays[0]; // Highest day number
          break;
        }
      }

      if (lastMonth !== -1 && lastDay !== -1) {
        // Set the timeline to the last available date
        setSelectedMonth(lastMonth);
        setSelectedDay(lastDay);
        setCurrentViewDate({ year, month: lastMonth, day: lastDay });

        // Scroll to the date in the transmission list
        if ((window as any).scrollToDate) {
          (window as any).scrollToDate(year, lastMonth, lastDay);
        }

        // Also trigger transmission refresh via global handler
        if ((window as any).handleTimelineChange) {
          (window as any).handleTimelineChange(year, lastMonth, lastDay);
        }
      } else {
        // Fallback: set to first available month but no day selected
        setSelectedMonth(getFirstAvailableMonth(year));
        setSelectedDay(null);
      }
    } else {
      // Year has no data, fallback
      setSelectedMonth(getFirstAvailableMonth(year));
      setSelectedDay(null);
    }

    // Notify HomeClient of year change
    if ((window as any).handleYearChange) {
      (window as any).handleYearChange(year);
    }
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

    // Find the last available day with transmissions in this month
    const monthData = dateAvailability[selectedYear]?.[monthIndex];
    if (monthData && monthData.size > 0) {
      const availableDays = Array.from(monthData).sort((a, b) => b - a); // Sort descending
      const lastDay = availableDays[0]; // Get the highest (last) day

      setSelectedDay(lastDay);

      // Immediately update the current view
      setCurrentViewDate({ year: selectedYear, month: monthIndex, day: lastDay });

      // Scroll to the date in the transmission list
      if ((window as any).scrollToDate) {
        (window as any).scrollToDate(selectedYear, monthIndex, lastDay);
      }

      // Also trigger transmission refresh via global handler
      if ((window as any).handleTimelineChange) {
        (window as any).handleTimelineChange(selectedYear, monthIndex, lastDay);
      }
    } else {
      setSelectedDay(null); // Reset day when month has no transmissions
    }
  };

  const handleDayChange = (day: number) => {
    setSelectedDay(day);

    // Immediately update the current view to prevent double highlighting
    setCurrentViewDate({ year: selectedYear, month: selectedMonth, day });

    // Scroll to the date in the transmission list
    if ((window as any).scrollToDate) {
      (window as any).scrollToDate(selectedYear, selectedMonth, day);
    }

    // Also trigger transmission refresh via global handler
    if ((window as any).handleTimelineChange) {
      (window as any).handleTimelineChange(selectedYear, selectedMonth, day);
    }
  };

  // Add function to handle external highlight updates
  useEffect(() => {
    (window as any).updateTimelineHighlight = (year: number, month: number, day: number) => {
      // Don't update if we have a manually selected day that's different
      if (selectedDay !== null && selectedYear === year && selectedMonth === month && selectedDay !== day) {
        console.log('Ignoring scroll highlight update - manual selection active:', selectedDay);
        return;
      }

      setCurrentViewDate({ year, month, day });
      // Clear selected day when scroll updates the view
      setSelectedDay(null);
      // Also update the selected date in the timeline if it's different
      setSelectedYear(currentYear => {
        if (year !== currentYear) {
          return year;
        }
        return currentYear;
      });
      setSelectedMonth(currentMonth => {
        if (month !== currentMonth) {
          return month;
        }
        return currentMonth;
      });
    };

    return () => {
      delete (window as any).updateTimelineHighlight;
    };
  }, []);


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
              const isCurrentView = currentViewDate?.year === selectedYear &&
                                  currentViewDate?.month === selectedMonth &&
                                  currentViewDate?.day === day;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => isClickable && handleDayChange(day)}
                  disabled={!isClickable}
                  className={`${styles.dayButton} ${
                    isSelected ? styles.dayButtonActive : ""
                  } ${isCurrentView ? styles.dayButtonCurrentView : ""} ${
                    !isValidDay ? styles.dayButtonDisabled : ""
                  } ${
                    hasTransmissions ? styles.dayButtonHasTransmissions : ""
                  }`}
                  title={
                    isClickable
                      ? `${months[selectedMonth]} ${day}, ${selectedYear} - Has transmissions${isCurrentView ? ' (Currently viewing)' : ''}`
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
