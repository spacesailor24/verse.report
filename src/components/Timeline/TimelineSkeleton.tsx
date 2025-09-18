import styles from './Timeline.module.css';

export default function TimelineSkeleton() {
  const months = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  const currentYear = new Date().getFullYear();

  return (
    <nav className={styles.timelineNav}>
      <div className={styles.navContainer}>
        {/* Month selector row skeleton */}
        <div className={styles.monthRow}>
          {/* Hamburger button skeleton */}
          <button className={styles.hamburgerButton}>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>

          {/* Year dropdown skeleton */}
          <div className={styles.yearDropdownContainer}>
            <button className={styles.yearDropdown}>
              <span>{currentYear}</span>
              <span className={styles.yearDropdownArrow}>▼</span>
            </button>
          </div>

          {/* Month scroller with actual month names */}
          <div className={styles.monthScroller}>
            {months.map((month, i) => (
              <button
                key={i}
                className={`${styles.monthButton} ${styles.monthButtonDisabled}`}
                disabled
              >
                {month}
              </button>
            ))}
          </div>
        </div>

        {/* Day selector row with actual day numbers */}
        <div className={styles.dayRow}>
          <div className={styles.dayScroller}>
            {Array.from({ length: 31 }, (_, i) => (
              <button
                key={i}
                className={`${styles.dayButton} ${styles.dayButtonDisabled}`}
                disabled
              >
                {String(i + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}