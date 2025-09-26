"use client";

import styles from "./YouTubeEmbed.module.css";

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

// Extract YouTube video ID from various YouTube URL formats
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export default function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    // Fallback to regular link if not a valid YouTube URL
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>
        {title || url}
      </a>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className={styles.youtubeContainer}>
      <div className={styles.youtubeWrapper}>
        <iframe
          src={embedUrl}
          title={title || "YouTube video player"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className={styles.youtubeIframe}
        />
      </div>
      {title && <div className={styles.videoTitle}>{title}</div>}
    </div>
  );
}