"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import styles from "./TransmissionBox.module.css";

export type TransmissionType = "OFFICIAL" | "LEAK" | "PREDICTION";

export interface Transmission {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  type: TransmissionType;
  sourceId: number;
  sourceAuthor: string | null;
  sourceUrl: string | null;
  publishedAt: string | Date;
  publisher: {
    id: string;
    name: string | null;
    email: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    categorySlug: string;
  }>;
}

interface TransmissionBoxProps {
  transmission: Transmission;
  isShared?: boolean;
  autoExpand?: boolean;
}

const typeColors = {
  OFFICIAL: "var(--transmission-official)",
  LEAK: "var(--transmission-leak)",
  PREDICTION: "var(--transmission-prediction)",
};

const typeDotColors = {
  OFFICIAL: "var(--transmission-official)",
  LEAK: "var(--transmission-leak)",
  PREDICTION: "var(--transmission-prediction)",
};

const getCategoryColor = (categorySlug: string) => {
  const colorMap = {
    ships: "var(--category-ship)",
    patches: "var(--category-patch)",
    creatures: "var(--category-creature)",
    locations: "var(--category-location)",
    events: "var(--category-event)",
    features: "var(--category-feature)",
  };
  return colorMap[categorySlug as keyof typeof colorMap] || "#888888";
};

export default function TransmissionBox({
  transmission,
  isShared = false,
  autoExpand = false
}: TransmissionBoxProps) {
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const { data: session } = useSession();
  const router = useRouter();

  const hasContent = transmission.content && transmission.content.trim().length > 0;

  const handleClick = () => {
    // Only allow expansion if there's content to show
    if (hasContent) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the main click handler

    // Prepare transmission data for the broadcast form
    const editData = {
      id: transmission.id,
      title: transmission.title,
      subtitle: transmission.summary || '',
      content: transmission.content,
      type: transmission.type,
      sourceId: transmission.sourceId,
      sourceUrl: transmission.sourceUrl || '',
      publishedAt: transmission.publishedAt,
      tagIds: transmission.tags.map(tag => tag.id),
    };

    // Encode the data as base64 URL parameter
    const encodedData = btoa(JSON.stringify(editData))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Navigate to broadcast form with edit data
    router.push(`/broadcast?edit=${encodedData}`);
  };

  const hasEditPermission = () => {
    const userRoles = (session?.user as any)?.roles || [];
    return userRoles.includes('admin') || userRoles.includes('editor');
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the main click handler

    const shareUrl = `${window.location.origin}/?shared=${transmission.id}`;

    try {
      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: transmission.title,
          text: transmission.summary || 'Check out this transmission',
          url: shareUrl,
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(shareUrl);
        // You could show a toast notification here
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard copy if share fails
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        alert('Unable to share or copy link');
      }
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const month = dateObj.toLocaleDateString("en-US", { month: "long" });
    const day = dateObj.getDate();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
        ? "rd"
        : "th";
    return `${month} ${day}${suffix}`;
  };


  return (
    <div
      className={`${styles.transmissionBox} ${
        isExpanded ? styles.expanded : ""
      } ${!hasContent ? styles.noContent : ""} ${isShared ? styles.sharedTransmission : ""}`}
      onClick={handleClick}
      style={{ cursor: hasContent ? 'pointer' : 'default' }}
    >
      {/* Sci-fi geometric elements */}
      <div className={styles.sciFiElements}></div>
      <div className={styles.detailLines}></div>
      <div className={styles.circuitPattern}></div>
      <div className={styles.scanLine}></div>

      {/* File Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.headerContent}>
          <div className={styles.leftSection}>
            <div
              className={styles.typeDot}
              style={{ backgroundColor: typeDotColors[transmission.type] }}
            ></div>
            <span
              className={styles.typeLabel}
              style={{ color: typeColors[transmission.type] }}
            >
              {transmission.type}
            </span>
            <span className={styles.separator}>|</span>
            <div className={styles.tags}>
              {transmission.tags.map((tag, index) => (
                <span key={tag.id}>
                  <span
                    className={styles.tag}
                    style={{ color: getCategoryColor(tag.categorySlug) }}
                  >
                    {tag.name}
                  </span>
                  {index < transmission.tags.length - 1 && (
                    <span className={styles.separator}> /</span>
                  )}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.rightSection}>
            {transmission.sourceAuthor && (
              <>
                {transmission.sourceUrl ? (
                  <a
                    href={transmission.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.sourceLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {transmission.sourceAuthor}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15,3 21,3 21,9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                ) : (
                  <span className={styles.sourceAuthor}>
                    {transmission.sourceAuthor}
                  </span>
                )}
                <span className={styles.separator}>|</span>
              </>
            )}
            <span className={styles.date}>
              {formatDate(transmission.publishedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        <div className={styles.contentHeader}>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>{transmission.title}</h3>
            {transmission.summary && (
              <p className={styles.summary}>{transmission.summary}</p>
            )}
          </div>
          <div className={styles.topRightActions}>
            <div className={styles.shareAction} onClick={handleShareClick}>
              <span>SHARE_TRANSMISSION</span>
              <span>»</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <div className={styles.leftActions}>
            {hasEditPermission() && (
              <div className={styles.editButton} onClick={handleEditClick}>
                <span>EDIT_TRANSMISSION</span>
                <span>✎</span>
              </div>
            )}
          </div>
          <div className={styles.rightActions}>
            <div className={`${styles.openAction} ${!hasContent ? styles.openActionDisabled : ''}`}>
              <span>
                {!hasContent
                  ? "NO_CONTENT"
                  : (isExpanded ? "CLOSE_TRANSMISSION" : "OPEN_TRANSMISSION")}
              </span>
              <span>
                {!hasContent ? "⊘" : (isExpanded ? "«" : "»")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.markdownContent}>
            <ReactMarkdown>{transmission.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
