"use client";

import styles from "./TransmissionSkeleton.module.css";

export default function TransmissionSkeleton() {
  return (
    <div className={styles.transmissionSkeleton}>
      {/* Geometric elements for sci-fi look */}
      <div className={styles.sciFiElements}></div>
      <div className={styles.detailLines}></div>
      <div className={styles.circuitPattern}></div>

      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.headerContent}>
          <div className={styles.leftSection}>
            <div className={styles.skeletonDot}></div>
            <div className={styles.skeletonText} style={{ width: '60px' }}></div>
            <div className={styles.skeletonText} style={{ width: '80px' }}></div>
          </div>
          <div className={styles.rightSection}>
            <div className={styles.skeletonText} style={{ width: '40px' }}></div>
            <div className={styles.skeletonText} style={{ width: '40px' }}></div>
            <div className={styles.skeletonText} style={{ width: '70px' }}></div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        <div className={styles.contentHeader}>
          <div className={styles.titleSection}>
            {/* Title skeleton */}
            <div className={styles.skeletonTitle}></div>
            {/* Summary skeleton */}
            <div className={styles.skeletonSummary}>
              <div className={styles.skeletonText} style={{ width: '100%' }}></div>
              <div className={styles.skeletonText} style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className={styles.actions}>
            <div className={styles.skeletonText} style={{ width: '50px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}