"use client";

import { useState } from "react";
import styles from "./Sidebar.module.css";

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
  color: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
  expanded?: boolean;
}

interface SidebarClientProps {
  initialCategories: Category[];
}

export default function SidebarClient({
  initialCategories,
}: SidebarClientProps) {
  const [categories, setCategories] = useState<Category[]>(
    initialCategories.map((category) => ({ ...category, expanded: false }))
  );
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const toggleCategoryExpansion = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? { ...category, expanded: !category.expanded }
          : category
      )
    );
  };

  const toggleCategory = (categoryId: string) => {
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(`category-${categoryId}`)) {
        newFilters.delete(`category-${categoryId}`);
      } else {
        newFilters.add(`category-${categoryId}`);
      }
      return newFilters;
    });
  };

  const toggleTag = (tagId: string) => {
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(`tag-${tagId}`)) {
        newFilters.delete(`tag-${tagId}`);
      } else {
        newFilters.add(`tag-${tagId}`);
      }
      return newFilters;
    });
  };

  const getActiveCount = () => {
    return activeFilters.size;
  };

  const isCategoryActive = (categoryId: string) => {
    return activeFilters.has(`category-${categoryId}`);
  };

  const isTagActive = (tagId: string) => {
    return activeFilters.has(`tag-${tagId}`);
  };

  const getActiveTags = (category: Category) => {
    return category.tags.filter((tag) => isTagActive(tag.id)).length;
  };

  return (
    <aside className="w-80 bg-black border-r border-white/10 flex flex-col h-screen font-mono text-sm">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-2 text-nasa">
          <span className="text-white">&gt;</span>
          <span className={styles.systemName}>VERSE.REPORT</span>
          <span className="text-white/40 text-xs">v1.0.0</span>
        </div>
      </div>

      <div className="border-b border-white/10 px-4 py-2 flex justify-between items-center">
        <span className="text-white/60">TRANSMISSION_FILTERS</span>
        <span className="text-nasa">[{getActiveCount()}]</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleCategoryExpansion(category.id)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <span className="text-xs">{category.expanded ? "v" : ">"}</span>
              </button>

              <button
                onClick={() => toggleCategory(category.id)}
                className="flex items-center gap-2 flex-1 hover:text-nasa transition-colors group"
              >
                <span
                  className={`text-xs ${
                    isCategoryActive(category.id)
                      ? "text-nasa"
                      : "text-white/40"
                  }`}
                >
                  [{isCategoryActive(category.id) ? "X" : " "}]
                </span>
                <span
                  className={`uppercase tracking-wider ${
                    isCategoryActive(category.id)
                      ? "text-nasa"
                      : "text-white/80"
                  }`}
                  style={{
                    color:
                      isCategoryActive(category.id) && category.color
                        ? category.color
                        : undefined,
                  }}
                >
                  {category.name}
                </span>
              </button>

              {category.tags.length > 0 && (
                <span className="text-white/40 text-xs">
                  [{getActiveTags(category)}]
                </span>
              )}
            </div>

            {category.expanded && category.tags.length > 0 && (
              <div className="ml-4 space-y-1">
                {category.tags.map((tag, index) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className="flex items-center gap-2 w-full hover:text-nasa transition-colors text-left"
                  >
                    <span className="text-white/20">
                      {index === category.tags.length - 1 ? "L" : "|"}
                    </span>
                    <span
                      className={`text-xs ${
                        isTagActive(tag.id) ? "text-nasa" : "text-white/40"
                      }`}
                    >
                      [{isTagActive(tag.id) ? "X" : " "}]
                    </span>
                    <span
                      className={`${
                        isTagActive(tag.id) ? "text-nasa" : "text-white/60"
                      }`}
                    >
                      {tag.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
