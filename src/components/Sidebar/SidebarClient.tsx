"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";
import { useMobileMenu } from "@/contexts/MobileMenuContext";
import { useFilters } from "@/contexts/FilterContext";

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
  expanded?: boolean;
}

interface SidebarClientProps {
  initialCategories: Category[];
}

const getCategoryColor = (categorySlug: string) => {
  const colorMap = {
    'ships': 'var(--category-ship)',
    'patches': 'var(--category-patch)',
    'creatures': 'var(--category-creature)',
    'locations': 'var(--category-location)',
    'events': 'var(--category-event)',
    'features': 'var(--category-feature)',
  };
  return colorMap[categorySlug as keyof typeof colorMap] || undefined;
};

export default function SidebarClient({
  initialCategories,
}: SidebarClientProps) {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
  const { selectedFilters, toggleFilter } = useFilters();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(
    initialCategories.map((category) => ({ ...category, expanded: false }))
  );
  const [isSigningIn, setIsSigningIn] = useState(false);

  const hasEditPermission = () => {
    const userRoles = (session?.user as any)?.roles || [];
    return userRoles.includes('admin') || userRoles.includes('editor');
  };

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
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    const isCurrentlyActive = selectedFilters.has(`category-${categoryId}`);

    if (isCurrentlyActive) {
      // Deselect category and all its tags
      toggleFilter(`category-${categoryId}`);
      category.tags.forEach((tag) => {
        if (selectedFilters.has(`tag-${tag.id}`)) {
          toggleFilter(`tag-${tag.id}`);
        }
      });
    } else {
      // Select category and all its tags
      toggleFilter(`category-${categoryId}`);
      category.tags.forEach((tag) => {
        if (!selectedFilters.has(`tag-${tag.id}`)) {
          toggleFilter(`tag-${tag.id}`);
        }
      });
    }
  };

  const handleToggleTag = (tagId: string, categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    // Toggle the tag
    toggleFilter(`tag-${tagId}`);

    // Get the updated state by checking what would be the result
    const wouldBeActive = !selectedFilters.has(`tag-${tagId}`);

    // Check if all tags in this category would be selected
    const allTagsWouldBeSelected = category.tags.every((tag) =>
      tag.id === tagId ? wouldBeActive : selectedFilters.has(`tag-${tag.id}`)
    );

    // Check if no tags in this category would be selected
    const noTagsWouldBeSelected = category.tags.every(
      (tag) => tag.id === tagId ? !wouldBeActive : !selectedFilters.has(`tag-${tag.id}`)
    );

    // Auto-select/deselect parent category based on children
    if (allTagsWouldBeSelected && !selectedFilters.has(`category-${categoryId}`)) {
      toggleFilter(`category-${categoryId}`);
    } else if (noTagsWouldBeSelected && selectedFilters.has(`category-${categoryId}`)) {
      toggleFilter(`category-${categoryId}`);
    } else if (!noTagsWouldBeSelected && !allTagsWouldBeSelected && selectedFilters.has(`category-${categoryId}`)) {
      // Partial selection - remove category selection but keep individual tags
      toggleFilter(`category-${categoryId}`);
    }
  };

  const getActiveCount = () => {
    return Array.from(selectedFilters).filter(filter => filter.startsWith('tag-')).length;
  };

  const isCategoryActive = (categoryId: string) => {
    return selectedFilters.has(`category-${categoryId}`);
  };

  const isTagActive = (tagId: string) => {
    return selectedFilters.has(`tag-${tagId}`);
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
          {/* Mobile close button - positioned like the hamburger menu */}
          <button
            className={`${styles.mobileCloseButton} ${isMobileMenuOpen ? styles.mobileCloseButtonVisible : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <span className={styles.closeIcon}>×</span>
          </button>
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
                      hasAnyActiveChildren(category)
                        ? getCategoryColor(category.slug)
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
                    onClick={() => handleToggleTag(tag.id, category.id)}
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

      {/* Auth Section */}
      <div className={styles.authSection}>
        {status === "loading" ? (
          <div className={styles.authLoading}>
            <span className={styles.authText}>LOADING...</span>
          </div>
        ) : session?.user ? (
          <div className={styles.authUser}>
            {hasEditPermission() && (
              <button
                onClick={() => router.push('/broadcast')}
                className={styles.broadcastButton}
              >
                <span className={styles.broadcastPrompt}>&gt;</span>
                <span className={styles.broadcastText}>BROADCAST_TRANSMISSION</span>
              </button>
            )}
            <div className={styles.userInfo}>
              <span className={styles.authPrompt}>&gt;</span>
              <span className={styles.userName}>{session.user.name}</span>
              {(session.user as any).roles?.length > 0 && (
                <div className={styles.rolesBadges}>
                  {(session.user as any).roles.map((role: string) => (
                    <span key={role} className={styles.roleBadge}>
                      [{role.toUpperCase()}]
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => signOut()}
              className={styles.authButton}
            >
              <span className={styles.authButtonText}>LOGOUT</span>
            </button>
          </div>
        ) : (
          <div className={styles.authLogin}>
            <button
              onClick={async () => {
                setIsSigningIn(true);
                await signIn("discord");
              }}
              disabled={isSigningIn}
              className={styles.authButton}
            >
              <span className={styles.authPrompt}>&gt;</span>
              <span className={styles.authButtonText}>
                {isSigningIn ? "CONNECTING..." : "LOGIN"}
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
