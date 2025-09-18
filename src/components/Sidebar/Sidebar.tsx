"use client";

import { useState, useEffect } from 'react';
import SidebarClient from './SidebarClient';
import SidebarSkeleton from './SidebarSkeleton';

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    shipFamily: {
      id: string;
      name: string;
    } | null;
  }>;
}

export default function Sidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
    return <SidebarSkeleton />;
  }

  return <SidebarClient initialCategories={categories} />;
}
