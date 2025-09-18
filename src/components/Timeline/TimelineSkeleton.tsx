import styles from './Timeline.module.css';

export default function TimelineSkeleton() {
  return (
    <nav className={styles.timelineNav}>
      <div className={styles.navContainer}>
        {/* Month selector row skeleton */}
        <div className={styles.monthRow}>
          {/* Hamburger button skeleton */}
          <div className={styles.hamburgerButton} style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-secondary)'
          }}>
            <div style={{ width: '20px', height: '2px', backgroundColor: 'var(--bg-surface-subtle)' }}></div>
            <div style={{ width: '20px', height: '2px', backgroundColor: 'var(--bg-surface-subtle)' }}></div>
            <div style={{ width: '20px', height: '2px', backgroundColor: 'var(--bg-surface-subtle)' }}></div>
          </div>

          {/* Year dropdown skeleton */}
          <div className={styles.yearDropdownContainer}>
            <div className={styles.yearDropdown} style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-secondary)',
              color: 'transparent'
            }}>
              <span>2024</span>
              <span>▼</span>
            </div>
          </div>

          {/* Month scroller skeleton */}
          <div className={styles.monthScroller}>
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className={styles.monthButton}
                style={{
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-secondary)',
                  color: 'transparent'
                }}
              >
                MONTH
              </div>
            ))}
          </div>
        </div>

        {/* Day selector row skeleton */}
        <div className={styles.dayRow}>
          <div className={styles.dayScroller}>
            {Array.from({ length: 31 }, (_, i) => (
              <div
                key={i}
                className={styles.dayButton}
                style={{
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-secondary)',
                  color: 'transparent'
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}