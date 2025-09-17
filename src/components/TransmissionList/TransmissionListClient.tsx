"use client";

import TransmissionBox, {
  Transmission,
} from "../TransmissionBox/TransmissionBox";
import styles from "./TransmissionList.module.css";

interface TransmissionListClientProps {
  transmissions: Transmission[];
  selectedDate?: { year: number; month: number; day: number };
  loading?: boolean;
  hasActiveFilters?: boolean;
}

export default function TransmissionListClient({
  transmissions,
  selectedDate,
  loading = false,
  hasActiveFilters = false,
}: TransmissionListClientProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.loadingIcon}>⟳</div>
          <h3 className={styles.loadingTitle}>LOADING TRANSMISSIONS...</h3>
          <p className={styles.loadingDescription}>
            Scanning transmission frequencies...
          </p>
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
      </div>
    </div>
  );
}
