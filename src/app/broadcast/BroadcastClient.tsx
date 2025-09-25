"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import TransmissionBox from "@/components/TransmissionBox/TransmissionBox";
import TransmissionSkeleton from "@/components/TransmissionBox/TransmissionSkeleton";
import { MobileMenuProvider } from "@/contexts/MobileMenuContext";
import { useFilters } from "@/contexts/FilterContext";
import styles from "./broadcast.module.css";

interface Tag {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  shipFamily: {
    id: string;
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  tags: Tag[];
}

interface Source {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

// Custom source dropdown component
function SourceDropdown({
  value,
  onChange,
  sources,
  disabled,
  placeholder
}: {
  value: number | null;
  onChange: (value: number) => void;
  sources: Source[];
  disabled: boolean;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedSource = sources.find(source => source.id === value);

  const handleSelect = (sourceId: number) => {
    onChange(sourceId);
    setIsOpen(false);
  };

  return (
    <div className={styles.categoryDropdownWrapper}>
      <button
        type="button"
        className={`${styles.categoryDropdown} ${isOpen ? styles.categoryDropdownOpen : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={styles.categoryDropdownText}>
          {selectedSource ? selectedSource.name : placeholder}
        </span>
        <span className={styles.categoryDropdownArrow}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className={styles.categoryDropdownMenu}>
          {sources.map(source => (
            <button
              key={source.id}
              type="button"
              className={`${styles.categoryDropdownItem} ${
                value === source.id ? styles.categoryDropdownItemActive : ''
              }`}
              onClick={() => handleSelect(source.id)}
            >
              {source.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Custom dropdown component similar to timeline date picker
function CategoryDropdown({
  value,
  onChange,
  categories,
  disabled,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
  disabled: boolean;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCategory = categories.find(cat => cat.id === value);

  const handleSelect = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  return (
    <div className={styles.categoryDropdownWrapper}>
      <button
        type="button"
        className={`${styles.categoryDropdown} ${isOpen ? styles.categoryDropdownOpen : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={styles.categoryDropdownText}>
          {selectedCategory ? selectedCategory.name : placeholder}
        </span>
        <span className={styles.categoryDropdownArrow}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className={styles.categoryDropdownMenu}>
          {categories.map(category => (
            <button
              key={category.id}
              type="button"
              className={`${styles.categoryDropdownItem} ${
                value === category.id ? styles.categoryDropdownItemActive : ''
              }`}
              onClick={() => handleSelect(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Custom type dropdown component similar to category dropdown
function TypeDropdown({
  value,
  onChange,
  disabled
}: {
  value: "OFFICIAL" | "LEAK" | "PREDICTION";
  onChange: (value: "OFFICIAL" | "LEAK" | "PREDICTION") => void;
  disabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const typeOptions = [
    { value: "OFFICIAL" as const, label: "OFFICIAL" },
    { value: "LEAK" as const, label: "LEAK" },
    { value: "PREDICTION" as const, label: "PREDICTION" }
  ];

  const selectedType = typeOptions.find(option => option.value === value);

  const handleSelect = (typeValue: "OFFICIAL" | "LEAK" | "PREDICTION") => {
    onChange(typeValue);
    setIsOpen(false);
  };

  return (
    <div className={styles.typeDropdownWrapper}>
      <button
        type="button"
        className={`${styles.typeDropdown} ${isOpen ? styles.typeDropdownOpen : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={styles.typeDropdownText}>
          {selectedType ? selectedType.label : "Select type..."}
        </span>
        <span className={styles.typeDropdownArrow}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className={styles.typeDropdownMenu}>
          {typeOptions.map(option => (
            <button
              key={option.value}
              type="button"
              className={`${styles.typeDropdownItem} ${
                value === option.value ? styles.typeDropdownItemActive : ''
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BroadcastForm() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceId, setSourceId] = useState<number | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [type, setType] = useState<"OFFICIAL" | "LEAK" | "PREDICTION">("OFFICIAL");
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [sources, setSources] = useState<Source[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [newTagCategory, setNewTagCategory] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceDescription, setNewSourceDescription] = useState("");
  const [isCreatingSource, setIsCreatingSource] = useState(false);
  const [publishedAt, setPublishedAt] = useState(() => {
    // Default to current date/time
    const now = new Date();
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    return now.toISOString().slice(0, 16);
  });

  const { data: session, status } = useSession();
  const router = useRouter();
  const { getActiveTagFilters, toggleFilter, selectedFilters } = useFilters();

  // Check if all required fields are filled
  const isFormValid = title.trim() && subtitle.trim() && sourceId !== null;

  // Fetch categories and tags
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
        setCategoriesLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Fetch sources
  useEffect(() => {
    async function fetchSources() {
      try {
        const response = await fetch('/api/sources');
        if (!response.ok) throw new Error('Failed to fetch sources');
        const data = await response.json();
        setSources(data.sources);
      } catch (error) {
        console.error('Error fetching sources:', error);
        setSources([]);
      } finally {
        setSourcesLoading(false);
      }
    }

    fetchSources();
  }, []);


  const handleCreateTag = async () => {
    if (!newTagName.trim() || !newTagCategory) {
      alert("Please enter a tag name and select a category");
      return;
    }

    setIsCreatingTag(true);

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          categoryId: newTagCategory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create tag");
      }

      const { tag } = await response.json();

      // Add the new tag to the selected filters
      toggleFilter(`tag-${tag.id}`);

      // Add the new tag to the categories list
      setCategories(prevCategories =>
        prevCategories.map(category => {
          if (category.id === newTagCategory) {
            return {
              ...category,
              tags: [...category.tags, tag],
            };
          }
          return category;
        })
      );

      // Clear the form
      setNewTagName("");
      setNewTagCategory("");

      alert(`Tag "${tag.name}" created and selected!`);
    } catch (error) {
      console.error("Error creating tag:", error);
      alert("Failed to create tag. Please try again.");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleCreateSource = async () => {
    if (!newSourceName.trim()) {
      alert("Please enter a source name");
      return;
    }

    setIsCreatingSource(true);

    try {
      const response = await fetch("/api/sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newSourceName.trim(),
          description: newSourceDescription.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create source");
      }

      const { source } = await response.json();

      // Select the new source
      setSourceId(source.id);

      // Add the new source to the sources list
      setSources(prevSources => [...prevSources, source].sort((a, b) => a.sortOrder - b.sortOrder));

      // Clear the form
      setNewSourceName("");
      setNewSourceDescription("");

      alert(`Source "${source.name}" created and selected!`);
    } catch (error) {
      console.error("Error creating source:", error);
      alert(`Failed to create source: ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setIsCreatingSource(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !subtitle.trim() || sourceId === null) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/transmissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim(),
          content: content.trim(),
          sourceId: sourceId,
          sourceUrl: sourceUrl.trim() || null,
          type,
          publishedAt: new Date(publishedAt).toISOString(),
          tagIds: getActiveTagFilters(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create transmission");
      }

      // Reset form
      setTitle("");
      setSubtitle("");
      setContent("");
      setSourceId(null);
      setSourceUrl("");
      setType("OFFICIAL");
      setPublishedAt(new Date().toISOString().slice(0, 16));

      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Error creating transmission:", error);
      alert("Failed to create transmission. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create preview data with selected tags from filters
  const getSelectedTagsData = useMemo(() => {
    const selectedTagIds = getActiveTagFilters();
    const tagData: Array<{
      id: string;
      name: string;
      slug: string;
      categorySlug: string;
    }> = [];

    categories.forEach(category => {
      category.tags.forEach(tag => {
        // Convert tag.id to string for comparison since getActiveTagFilters() returns strings
        if (selectedTagIds.includes(String(tag.id))) {
          tagData.push({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            categorySlug: category.slug,
          });
        }
      });
    });

    return tagData;
  }, [selectedFilters, categories]);

  const selectedSource = sources.find(s => s.id === sourceId);

  const previewTransmission = {
    id: "preview",
    title: title || "Enter transmission title...",
    content: content || "Write your transmission content here...",
    summary: subtitle || "Brief description or summary...",
    type,
    sourceAuthor: selectedSource ? selectedSource.name : "Select a source...",
    sourceUrl: sourceUrl || null,
    publishedAt: new Date(publishedAt).toISOString(),
    publisher: {
      id: session?.user?.id || "preview-user",
      name: session?.user?.name || "Preview User",
      email: session?.user?.email || "preview@example.com",
    },
    tags: getSelectedTagsData,
  };

  return (
    <MobileMenuProvider>
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.splitContainer}>
            <div className={styles.formSection}>
              <header className={styles.header}>
                <h1 className={styles.title}>BROADCAST_TRANSMISSION</h1>
                <p className={styles.subtitle}>Create a new transmission for the verse</p>
              </header>

              <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                  TITLE *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.input}
                  placeholder="Enter transmission title..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subtitle" className={styles.label}>
                  SUBTITLE *
                </label>
                <input
                  id="subtitle"
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className={styles.input}
                  placeholder="Brief description or summary..."
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    TYPE *
                  </label>
                  <TypeDropdown
                    value={type}
                    onChange={setType}
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    SOURCE *
                  </label>
                  <SourceDropdown
                    value={sourceId}
                    onChange={setSourceId}
                    sources={sources}
                    disabled={isLoading || sourcesLoading}
                    placeholder="Select source..."
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="publishedAt" className={styles.label}>
                  PUBLISHED DATE *
                </label>
                <input
                  id="publishedAt"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className={styles.input}
                  required
                />
                <div className={styles.tagHelperText}>
                  Set the actual date/time when this news occurred (can be in the past)
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="sourceUrl" className={styles.label}>
                  SOURCE URL
                </label>
                <input
                  id="sourceUrl"
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className={styles.input}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="content" className={styles.label}>
                  CONTENT
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={styles.textarea}
                  placeholder="Write your transmission content here..."
                  rows={12}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>CREATE NEW TAG</label>
                <div className={styles.newTagContainer}>
                  <CategoryDropdown
                    value={newTagCategory}
                    onChange={setNewTagCategory}
                    categories={categories}
                    disabled={isCreatingTag || categoriesLoading}
                    placeholder="Select category..."
                  />
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className={styles.input}
                    placeholder="Enter tag name..."
                    disabled={isCreatingTag}
                  />
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    className={styles.createTagButton}
                    disabled={isCreatingTag || !newTagName.trim() || !newTagCategory}
                  >
                    {isCreatingTag ? "CREATING..." : "CREATE_TAG"}
                  </button>
                </div>
                <div className={styles.tagHelperText}>
                  New tags will be automatically selected for this transmission
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>CREATE NEW SOURCE</label>
                <div className={styles.newSourceContainer}>
                  <input
                    type="text"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    className={styles.input}
                    placeholder="Enter source name..."
                    disabled={isCreatingSource}
                  />
                  <input
                    type="text"
                    value={newSourceDescription}
                    onChange={(e) => setNewSourceDescription(e.target.value)}
                    className={styles.input}
                    placeholder="Description (optional)..."
                    disabled={isCreatingSource}
                  />
                  <button
                    type="button"
                    onClick={handleCreateSource}
                    className={styles.createSourceButton}
                    disabled={isCreatingSource || !newSourceName.trim()}
                  >
                    {isCreatingSource ? "CREATING..." : "CREATE_SOURCE"}
                  </button>
                </div>
                <div className={styles.tagHelperText}>
                  New sources will be automatically selected for this transmission
                </div>
              </div>

              <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className={styles.cancelButton}
                    disabled={isLoading}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading || !isFormValid}
                  >
                    {isLoading ? "BROADCASTING..." : "BROADCAST_TRANSMISSION"}
                  </button>
                </div>
              </form>
            </div>

            <div className={styles.previewSection}>
              <header className={styles.previewHeader}>
                <h2 className={styles.previewTitle}>TRANSMISSION_PREVIEW</h2>
                <p className={styles.previewSubtitle}>Live preview of your transmission</p>
              </header>
              <div className={styles.previewContainer}>
                {status === "loading" || categoriesLoading || sourcesLoading ? (
                  <TransmissionSkeleton />
                ) : (
                  <TransmissionBox transmission={previewTransmission} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </MobileMenuProvider>
  );
}

export default function BroadcastClient() {
  return <BroadcastForm />;
}