"use client";

import TransmissionBox, {
  Transmission,
} from "../TransmissionBox/TransmissionBox";
import styles from "./TransmissionList.module.css";

interface TransmissionListClientProps {
  transmissions: Transmission[];
  selectedDate?: { year: number; month: number; day: number };
}

export default function TransmissionListClient({
  transmissions,
  selectedDate,
}: TransmissionListClientProps) {
  if (transmissions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🚫</div>
        <h3 className={styles.emptyTitle}>NO TRANSMISSIONS FOUND</h3>
        <p className={styles.emptyDescription}>
          {selectedDate
            ? "No transmissions available for the selected date."
            : "No transmissions available."}
        </p>
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
