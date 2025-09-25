"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TransmissionList from "@/components/TransmissionList/TransmissionList";

interface MainContentClientProps {
  selectedYear?: number;
  sharedTransmissionId?: string | null;
}

export default function MainContentClient({ selectedYear, sharedTransmissionId }: MainContentClientProps) {
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | undefined>(undefined);
  const [currentViewDate, setCurrentViewDate] = useState<{ year: number; month: number; day: number } | null>(null);
  const currentViewDateRef = useRef<{ year: number; month: number; day: number } | null>(null);
  const dateRefsRef = useRef<{ [key: string]: HTMLElement | null }>({});
  const mainRef = useRef<HTMLElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDateChange = async (year?: number, month?: number, day?: number) => {
    if (year !== undefined && month !== undefined && day !== undefined) {
      setSelectedDate({ year, month, day });
    } else {
      setSelectedDate(undefined);
    }
  };

  // Handle scroll to detect current visible date
  const handleScroll = () => {
    const scrollElement = mainRef.current;
    if (!scrollElement) return;

    const scrollTop = scrollElement.scrollTop;
    const windowHeight = scrollElement.clientHeight;
    const stickyHeaderHeight = 0; // No sticky header offset needed for main element scroll
    const viewportTop = scrollTop + stickyHeaderHeight;

    const availableRefs = Object.keys(dateRefsRef.current).filter(key => dateRefsRef.current[key] !== null);
    if (availableRefs.length === 0) {
      return; // No refs registered yet
    }

    let targetDate = null;
    let closestToTop = null;
    let closestTopDistance = Infinity;

    // Find the transmission group closest to the top of the viewport
    availableRefs.forEach(dateKey => {
      const dateElement = dateRefsRef.current[dateKey];
      if (dateElement) {
        const rect = dateElement.getBoundingClientRect();
        const mainRect = scrollElement.getBoundingClientRect();

        // Calculate position relative to the main container
        const elementTop = rect.top - mainRect.top;
        const elementBottom = rect.bottom - mainRect.top;

        // Check if element is visible in the viewport
        if (elementBottom > 0 && elementTop < windowHeight) {
          const distanceFromTop = Math.abs(elementTop);


          if (distanceFromTop < closestTopDistance) {
            closestTopDistance = distanceFromTop;
            closestToTop = dateKey;
          }
        }
      }
    });

    // Check if we're near the bottom of the scrollable area
    const scrollHeight = scrollElement.scrollHeight;
    const isNearBottom = scrollTop + windowHeight >= scrollHeight - 50;

    if (isNearBottom) {
      // When near bottom, find the bottommost visible element
      let bottomMostDate = null;
      let bottomMostPosition = -1;

      availableRefs.forEach(dateKey => {
        const dateElement = dateRefsRef.current[dateKey];
        if (dateElement) {
          const rect = dateElement.getBoundingClientRect();
          const mainRect = scrollElement.getBoundingClientRect();
          const elementBottom = rect.bottom - mainRect.top;

          if (rect.top - mainRect.top < windowHeight && elementBottom > 0) {
            if (elementBottom > bottomMostPosition) {
              bottomMostPosition = elementBottom;
              bottomMostDate = dateKey;
            }
          }
        }
      });
      targetDate = bottomMostDate;
    } else {
      targetDate = closestToTop;
    }

    const currentDateKey = currentViewDateRef.current ?
      `${currentViewDateRef.current.year}-${currentViewDateRef.current.month}-${currentViewDateRef.current.day}` :
      null;


    if (targetDate && targetDate !== currentDateKey) {
      const [year, month, day] = targetDate.split('-').map(Number);
      const newViewDate = { year, month, day };
      currentViewDateRef.current = newViewDate;
      setCurrentViewDate(newViewDate);

      // Always update timeline highlighting during scroll
      if ((window as any).updateTimelineHighlight) {
        (window as any).updateTimelineHighlight(year, month, day);
      }
    }
  };

  useEffect(() => {
    const scrollElement = mainRef.current;
    if (!scrollElement) {
      return;
    }

    const scrollHandler = () => {
      // Mark that we're scrolling
      isScrollingRef.current = true;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set timeout to mark scrolling as stopped after 150ms of no scroll events
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);

      handleScroll();
    };

    scrollElement.addEventListener('scroll', scrollHandler, { passive: true });
    console.log('Scroll listener attached to main element');

    // Initial scroll detection after components have mounted
    const timeoutId = setTimeout(() => {
      console.log('Initial scroll detection');
      handleScroll();
    }, 1000);

    return () => {
      scrollElement.removeEventListener('scroll', scrollHandler);
      clearTimeout(timeoutId);
    };
  }, []);

  // Sync the ref with the state
  useEffect(() => {
    currentViewDateRef.current = currentViewDate;
  }, [currentViewDate]);

  // Trigger scroll detection when selectedYear changes
  useEffect(() => {
    if (selectedYear) {
      // Wait for new data to load and refs to be registered
      const timeoutId = setTimeout(() => {
        console.log('Triggering scroll detection after year change');
        handleScroll();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedYear]);

  // Make functions available globally
  useEffect(() => {
    console.log('Setting up global functions in MainContentClient');
    (window as any).handleTimelineChange = handleDateChange;
    (window as any).registerDateRef = (dateKey: string, element: HTMLElement | null) => {
      // Don't update refs while actively scrolling to prevent jumps
      if (isScrollingRef.current && dateRefsRef.current[dateKey]) {
        return;
      }

      if (element) {
        dateRefsRef.current[dateKey] = element;
      } else {
        delete dateRefsRef.current[dateKey];
      }
    };
    (window as any).scrollToDate = (year: number, month: number, day: number) => {
      const dateKey = `${year}-${month}-${day}`;
      const dateElement = dateRefsRef.current[dateKey];
      if (dateElement && mainRef.current) {
        const mainElement = mainRef.current;
        const rect = dateElement.getBoundingClientRect();
        const mainRect = mainElement.getBoundingClientRect();

        // Calculate the scroll position to put this element at the top
        const targetScrollTop = mainElement.scrollTop + (rect.top - mainRect.top);

        mainElement.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    };

    (window as any).scrollToTransmission = (transmissionId: string) => {
      const transmissionElement = document.getElementById(`transmission-${transmissionId}`);
      if (transmissionElement && mainRef.current) {
        const mainElement = mainRef.current;
        const rect = transmissionElement.getBoundingClientRect();
        const mainRect = mainElement.getBoundingClientRect();

        // Calculate the scroll position to put this element near the top with some padding
        const targetScrollTop = mainElement.scrollTop + (rect.top - mainRect.top) - 100;

        mainElement.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        });
      }
    };
    (window as any).triggerScrollDetection = () => {
      setTimeout(() => {
        console.log('Manual scroll detection triggered');
        handleScroll();
      }, 100);
    };

    return () => {
      delete (window as any).handleTimelineChange;
      delete (window as any).registerDateRef;
      delete (window as any).scrollToDate;
      delete (window as any).scrollToTransmission;
      delete (window as any).triggerScrollDetection;
    };
  }, []);

  return (
    <main ref={mainRef} className="flex-1 p-4 overflow-y-auto xl:ml-80">
      <TransmissionList
        selectedDate={selectedDate}
        selectedYear={selectedYear}
        sharedTransmissionId={sharedTransmissionId}
      />
    </main>
  );
}