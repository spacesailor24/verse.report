"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import ImageModal from "../ImageModal/ImageModal";
import YouTubeEmbed from "../YouTubeEmbed/YouTubeEmbed";
import styles from "./TransmissionBox.module.css";

export type TransmissionType = "OFFICIAL" | "LEAK" | "PREDICTION" | "COMMENTARY";

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
  COMMENTARY: "var(--transmission-commentary)",
};

const typeDotColors = {
  OFFICIAL: "var(--transmission-official)",
  LEAK: "var(--transmission-leak)",
  PREDICTION: "var(--transmission-prediction)",
  COMMENTARY: "var(--transmission-commentary)",
};

const getCategoryColor = (categorySlug: string) => {
  const colorMap = {
    ships: "var(--category-ship)",
    patches: "var(--category-patch)",
    creatures: "var(--category-creature)",
    locations: "var(--category-location)",
    events: "var(--category-event)",
    features: "var(--category-feature)",
    newsletter: "var(--category-newsletter)",
  };
  return colorMap[categorySlug as keyof typeof colorMap] || "#888888";
};

export default function TransmissionBox({
  transmission,
  isShared = false,
  autoExpand = false
}: TransmissionBoxProps) {
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const hasContent = transmission.content && transmission.content.trim().length > 0;

  // Helper function to check if a URL is a YouTube link
  const isYouTubeUrl = (url: string): boolean => {
    const youtubePatterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\//,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\//,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\//
    ];
    return youtubePatterns.some(pattern => pattern.test(url));
  };

  // Split content into parts, identifying YouTube URLs
  const renderMarkdownWithEmbeds = (content: string) => {
    // Split by lines and group them
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentMarkdownBlock = '';
    let blockIndex = 0;

    const flushMarkdownBlock = () => {
      if (currentMarkdownBlock.trim()) {
        elements.push(
          <ReactMarkdown
            key={`markdown-${blockIndex++}`}
            components={{
              img: ({ src, alt, ...props }) => (
                <img
                  {...props}
                  src={src}
                  alt={alt || ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImage({ src: src || "", alt: alt || "" });
                  }}
                />
              ),
              a: ({ href, children, ...props }) => {
                return (
                  <a
                    {...props}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {currentMarkdownBlock.trim()}
          </ReactMarkdown>
        );
        currentMarkdownBlock = '';
      }
    };

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Check if this line is just a YouTube URL
      if (trimmedLine && isYouTubeUrl(trimmedLine) && !trimmedLine.includes(' ')) {
        // Flush any accumulated markdown content first
        flushMarkdownBlock();

        // Add YouTube embed
        elements.push(
          <YouTubeEmbed key={`youtube-${blockIndex++}`} url={trimmedLine} />
        );
      } else {
        // Accumulate this line for markdown rendering
        currentMarkdownBlock += line + '\n';
      }
    });

    // Flush any remaining markdown content
    flushMarkdownBlock();

    return elements;
  };

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
        // Fallback to clipboard copy (silent)
        await navigator.clipboard.writeText(shareUrl);
        // Show success state
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard copy if share fails (silent)
      try {
        await navigator.clipboard.writeText(shareUrl);
        // Show success state
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
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
        <div className={styles.contentHeader}
             onClick={handleClick}
             style={{ cursor: hasContent ? 'pointer' : 'default' }}>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>{transmission.title}</h3>
            {transmission.summary && (
              <p className={styles.summary}>{transmission.summary}</p>
            )}
          </div>
          <div className={styles.topRightActions}>
            <div
              className={`${styles.shareAction} ${shareSuccess ? styles.shareActionSuccess : ''}`}
              onClick={handleShareClick}
            >
              <span>{shareSuccess ? 'COPIED!' : 'SHARE_TRANSMISSION'}</span>
              <span>{shareSuccess ? '✓' : '»'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}
             onClick={handleClick}
             style={{ cursor: hasContent ? 'pointer' : 'default' }}>
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
            {renderMarkdownWithEmbeds(transmission.content)}
          </div>
        </div>
      )}

      {/* Image Modal rendered at document level */}
      {modalImage && typeof document !== "undefined" &&
        createPortal(
          <ImageModal
            src={modalImage.src}
            alt={modalImage.alt}
            isOpen={!!modalImage}
            onClose={() => setModalImage(null)}
          />,
          document.body
        )}
    </div>
  );
}
