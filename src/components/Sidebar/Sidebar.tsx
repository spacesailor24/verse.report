"use client";

import { useState, useEffect } from 'react';
import SidebarClient from './SidebarClient';
import SidebarSkeleton from './SidebarSkeleton';

interface ShipFamily {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  categoryId: string;
  shipFamilyId: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  shipFamily: ShipFamily | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
}

export default function Sidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
        // Add a small delay before removing skeleton to prevent jump
        setTimeout(() => {
          setIsFirstLoad(false);
        }, 100);
      }
    }

    fetchCategories();
  }, [refreshKey]);

  // Listen for custom event to refetch categories
  useEffect(() => {
    const handleRefetchCategories = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('refetch-categories', handleRefetchCategories);
    return () => {
      window.removeEventListener('refetch-categories', handleRefetchCategories);
    };
  }, []);

  if (loading || isFirstLoad) {
    return <SidebarSkeleton />;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <SidebarClient initialCategories={categories} />
    </div>
  );
}
