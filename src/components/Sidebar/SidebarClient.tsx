"use client";

import { useState } from "react";
import styles from "./Sidebar.module.css";
import { useMobileMenu } from "@/contexts/MobileMenuContext";

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
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
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
      const category = categories.find((c) => c.id === categoryId);

      if (!category) return newFilters;

      const isCurrentlyActive = newFilters.has(`category-${categoryId}`);

      if (isCurrentlyActive) {
        // Deselect category and all its tags
        newFilters.delete(`category-${categoryId}`);
        category.tags.forEach((tag) => {
          newFilters.delete(`tag-${tag.id}`);
        });
      } else {
        // Select category and all its tags
        newFilters.add(`category-${categoryId}`);
        category.tags.forEach((tag) => {
          newFilters.add(`tag-${tag.id}`);
        });
      }

      return newFilters;
    });
  };

  const toggleTag = (tagId: string, categoryId: string) => {
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      const category = categories.find((c) => c.id === categoryId);

      if (!category) return newFilters;

      // Toggle the tag
      if (newFilters.has(`tag-${tagId}`)) {
        newFilters.delete(`tag-${tagId}`);
      } else {
        newFilters.add(`tag-${tagId}`);
      }

      // Check if all tags in this category are now selected
      const allTagsSelected = category.tags.every((tag) =>
        newFilters.has(`tag-${tag.id}`)
      );

      // Check if no tags in this category are selected
      const noTagsSelected = category.tags.every(
        (tag) => !newFilters.has(`tag-${tag.id}`)
      );

      // Auto-select/deselect parent category based on children
      if (allTagsSelected) {
        newFilters.add(`category-${categoryId}`);
      } else if (noTagsSelected) {
        newFilters.delete(`category-${categoryId}`);
      } else {
        // Partial selection - remove category selection but keep individual tags
        newFilters.delete(`category-${categoryId}`);
      }

      return newFilters;
    });
  };

  const getActiveCount = () => {
    return Array.from(activeFilters).filter(filter => filter.startsWith('tag-')).length;
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

  const hasAnyActiveChildren = (category: Category) => {
    return category.tags.some((tag) => isTagActive(tag.id));
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarMobileOpen : ''}`}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <span className={styles.headerPrompt}>&gt;</span>
            <span className={styles.systemName}>VERSE.REPORT</span>
            <span className={styles.headerVersion}>v1.0.0</span>
          </div>
        </div>

      <div className={styles.filterHeader}>
        <span className={getActiveCount() > 0 ? styles.filterTitleActive : styles.filterTitle}>TRANSMISSION_FILTERS</span>
        <span className={getActiveCount() > 0 ? styles.activeCountHighlighted : styles.activeCount}>[{getActiveCount()}]</span>
      </div>

      <div className={styles.categoriesContainer}>
        {categories.map((category) => (
          <div key={category.id} className={styles.categoryGroup}>
            <div className={styles.categoryHeader}>
              <button
                onClick={() => toggleCategoryExpansion(category.id)}
                className={styles.expandButton}
              >
                <span className={styles.expandIcon}>
                  {category.expanded ? "v" : ">"}
                </span>
              </button>

              <button
                onClick={() => toggleCategory(category.id)}
                className={styles.categoryButton}
              >
                <span
                  className={`${styles.categoryCheckbox} ${
                    isCategoryActive(category.id)
                      ? styles.categoryCheckboxActive
                      : styles.categoryCheckboxInactive
                  }`}
                >
                  [{isCategoryActive(category.id) ? "X" : " "}]
                </span>
                <span
                  className={`${styles.categoryName} ${
                    hasAnyActiveChildren(category)
                      ? styles.categoryNameActive
                      : styles.categoryNameInactive
                  }`}
                  style={{
                    color:
                      hasAnyActiveChildren(category) && category.color
                        ? category.color
                        : undefined,
                  }}
                >
                  {category.name}
                </span>
              </button>

              {category.tags.length > 0 && (
                <span className={getActiveTags(category) > 0 ? styles.tagCountActive : styles.tagCount}>
                  [{getActiveTags(category)}]
                </span>
              )}
            </div>

            {category.expanded && category.tags.length > 0 && (
              <div className={styles.tagsContainer}>
                {category.tags.map((tag, index) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id, category.id)}
                    className={styles.tagButton}
                  >
                    <span className={styles.tagConnector}>
                      {index === category.tags.length - 1 ? "L" : "|"}
                    </span>
                    <span
                      className={`${styles.tagCheckbox} ${
                        isTagActive(tag.id)
                          ? styles.tagCheckboxActive
                          : styles.tagCheckboxInactive
                      }`}
                    >
                      [{isTagActive(tag.id) ? "X" : " "}]
                    </span>
                    <span
                      className={`${styles.tagName} ${
                        isTagActive(tag.id)
                          ? styles.tagNameActive
                          : styles.tagNameInactive
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
    </>
  );
}
