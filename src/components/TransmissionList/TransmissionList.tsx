"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useFilters } from "@/contexts/FilterContext";
import TransmissionListClient from "./TransmissionListClient";
import TransmissionSkeleton from "../TransmissionBox/TransmissionSkeleton";
import { Transmission } from "../TransmissionBox/TransmissionBox";

interface TransmissionListProps {
  selectedDate?: { year: number; month: number; day: number };
  selectedYear?: number;
  sharedTransmissionId?: string | null;
}

export default function TransmissionList({
  selectedDate,
  selectedYear,
  sharedTransmissionId,
}: TransmissionListProps) {
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { getActiveTagFilters, hasActiveFilters, selectedFilters } = useFilters();
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchTransmissions = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!append) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      // Build filter object and encode as base64
      const filters: any = {};

      const activeTagFilters = getActiveTagFilters();
      if (activeTagFilters.length > 0) {
        filters.tags = activeTagFilters.map(id => parseInt(id));
      }

      // Note: selectedYear is used for timeline navigation only, not for filtering transmissions
      // This allows infinite scroll to work across all years

      // Only add filter param if there are actual filters
      if (Object.keys(filters).length > 0) {
        const filterJson = JSON.stringify(filters);
        // Use URL-safe base64 without padding
        const filterBase64 = btoa(filterJson)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        params.append('filter', filterBase64);
      }

      const response = await fetch(`/api/transmissions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transmissions');
      }

      const data = await response.json();

      if (append) {
        setTransmissions(prev => [...prev, ...data.transmissions]);
      } else {
        setTransmissions(data.transmissions);
      }

      setHasMore(data.pagination.hasNextPage);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching transmissions:', error);
      if (!append) {
        setTransmissions([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);

      // Trigger scroll detection after data loads
      if (!append && (window as any).triggerScrollDetection) {
        (window as any).triggerScrollDetection();
      }
    }
  }, [getActiveTagFilters, hasActiveFilters]);

  // Reset and fetch when filters change
  useEffect(() => {
    console.log('TransmissionList: Filters changed', {
      selectedFilters: Array.from(selectedFilters),
      activeTagFilters: getActiveTagFilters()
    });
    setCurrentPage(1);
    setTransmissions([]);
    fetchTransmissions(1, false);
  }, [selectedFilters, fetchTransmissions]);

  // Note: selectedYear no longer triggers refetch to allow cross-year infinite scroll

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchTransmissions(currentPage + 1, true);
        }
      },
      {
        threshold: 0.1,
        // Add root margin to trigger loading earlier (500px before reaching the target)
        rootMargin: '500px 0px 500px 0px'
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [currentPage, hasMore, loadingMore, loading]);

  // Handle timeline date selection for jumping/scrolling
  useEffect(() => {
    if (selectedDate) {
      // TODO: Implement scroll to date functionality
      console.log('Timeline date selected:', selectedDate);
    }
  }, [selectedDate]);

  // Handle shared transmission scrolling
  useEffect(() => {
    if (sharedTransmissionId && transmissions.length > 0) {
      // Find the shared transmission in the list
      const sharedTransmission = transmissions.find(t => t.id === sharedTransmissionId);
      if (sharedTransmission) {
        // Wait for the component to render and then scroll
        setTimeout(() => {
          if ((window as any).scrollToTransmission) {
            (window as any).scrollToTransmission(sharedTransmissionId);
          }
        }, 500);
      }
    }
  }, [sharedTransmissionId, transmissions]);

  return (
    <>
      <TransmissionListClient
        transmissions={transmissions}
        selectedDate={selectedDate}
        loading={loading}
        hasActiveFilters={hasActiveFilters()}
        loadingMore={loadingMore}
        sharedTransmissionId={sharedTransmissionId}
        observerTarget={observerTarget}
      />
    </>
  );
}
