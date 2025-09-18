"use client";

import TransmissionBox, {
  Transmission,
} from "../TransmissionBox/TransmissionBox";
import TransmissionSkeleton from "../TransmissionBox/TransmissionSkeleton";
import styles from "./TransmissionList.module.css";

interface TransmissionListClientProps {
  transmissions: Transmission[];
  selectedDate?: { year: number; month: number; day: number };
  loading?: boolean;
  hasActiveFilters?: boolean;
  loadingMore?: boolean;
}

export default function TransmissionListClient({
  transmissions,
  selectedDate,
  loading = false,
  hasActiveFilters = false,
  loadingMore = false,
}: TransmissionListClientProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.transmissionsList}>
          {Array.from({ length: 6 }, (_, i) => (
            <TransmissionSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (transmissions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🚫</div>
          <h3 className={styles.emptyTitle}>NO TRANSMISSIONS FOUND</h3>
          <p className={styles.emptyDescription}>
            {hasActiveFilters
              ? "No transmissions match the selected filters."
              : "No transmissions available."}
          </p>
        </div>
      </div>
    );
  }

  // Group transmissions by date for scroll detection
  const groupedByDate = transmissions.reduce((groups, transmission) => {
    if (!transmission.publishedAt) return groups;

    const date = new Date(transmission.publishedAt);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const dateKey = `${year}-${month}-${day}`;

    if (!groups[dateKey]) {
      groups[dateKey] = { year, month, day, transmissions: [] };
    }
    groups[dateKey].transmissions.push(transmission);

    return groups;
  }, {} as Record<string, { year: number; month: number; day: number; transmissions: Transmission[] }>);

  return (
    <div className={styles.container}>
      <div className={styles.transmissionsList}>
        {Object.entries(groupedByDate)
          .sort(([a], [b]) => {
            // Sort by date descending (newest first)
            const [yearA, monthA, dayA] = a.split('-').map(Number);
            const [yearB, monthB, dayB] = b.split('-').map(Number);
            const dateA = new Date(yearA, monthA, dayA);
            const dateB = new Date(yearB, monthB, dayB);
            return dateB.getTime() - dateA.getTime();
          })
          .map(([dateKey, group]) => (
            <div
              key={dateKey}
              ref={(el) => {
                if ((window as any).registerDateRef) {
                  (window as any).registerDateRef(dateKey, el);
                }
              }}
              style={{ marginBottom: '2rem' }}
            >
              <div className={styles.dateHeader}>
                {new Date(group.year, group.month, group.day).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }).toUpperCase().replace(/\s/g, '_').replace(/,/g, '')}
              </div>
              {group.transmissions.map((transmission) => (
                <TransmissionBox key={transmission.id} transmission={transmission} />
              ))}
            </div>
          ))}
        {loadingMore && (
          <>
            {Array.from({ length: 3 }, (_, i) => (
              <TransmissionSkeleton key={`skeleton-${i}`} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
