"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FilterContextType {
  selectedFilters: Set<string>;
  setSelectedFilters: (filters: Set<string>) => void;
  toggleFilter: (filterId: string) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
  getActiveTagFilters: () => string[];
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());

  const toggleFilter = (filterId: string) => {
    console.log('FilterContext: Toggling filter', filterId);
    setSelectedFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(filterId)) {
        newFilters.delete(filterId);
        console.log('FilterContext: Removed filter', filterId);
      } else {
        newFilters.add(filterId);
        console.log('FilterContext: Added filter', filterId);
      }
      console.log('FilterContext: New filters', Array.from(newFilters));
      return newFilters;
    });
  };

  const clearFilters = () => {
    setSelectedFilters(new Set());
  };

  const hasActiveFilters = () => {
    return Array.from(selectedFilters).some(filter => filter.startsWith('tag-'));
  };

  const getActiveTagFilters = () => {
    return Array.from(selectedFilters)
      .filter(filter => filter.startsWith('tag-'))
      .map(filter => filter.replace('tag-', ''));
  };

  return (
    <FilterContext.Provider
      value={{
        selectedFilters,
        setSelectedFilters,
        toggleFilter,
        clearFilters,
        hasActiveFilters,
        getActiveTagFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}