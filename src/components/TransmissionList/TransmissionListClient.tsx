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

  return (
    <div className={styles.container}>
      <div className={styles.transmissionsList}>
        {transmissions.map((transmission) => (
          <TransmissionBox key={transmission.id} transmission={transmission} />
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
