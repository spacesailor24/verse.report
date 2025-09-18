import styles from './Sidebar.module.css';

export default function SidebarSkeleton() {
  return (
    <aside className={styles.sidebar}>
      {/* Static header content - same as real sidebar */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.headerPrompt}>&gt;</span>
          <span className={styles.systemName}>VERSE.REPORT</span>
          <span className={styles.headerVersion}>v1.0.0</span>
        </div>
      </div>

      <div className={styles.sidebarContent}>
        {/* Filter header with actual content */}
        <div className={styles.filterHeader}>
          <span className={styles.filterTitle}>TRANSMISSION_FILTERS</span>
          <span className={styles.activeCount}>[0]</span>
        </div>

        {/* Category skeletons with actual UI elements */}
        <div className={styles.categoriesContainer}>
          {[
            { categoryWidth: '40px' }, // SHIPS
            { categoryWidth: '60px' }, // PATCHES
            { categoryWidth: '75px' }, // CREATURES
            { categoryWidth: '70px' }, // LOCATIONS
            { categoryWidth: '50px' }, // EVENTS
            { categoryWidth: '65px' } // FEATURES
          ].map((category, i) => (
            <div key={i} className={styles.categoryGroup}>
              <div className={styles.categoryHeader}>
                <button className={styles.expandButton}>
                  <span className={styles.expandIcon}>{">"}</span>
                </button>
                <button className={styles.categoryButton}>
                  <span className={`${styles.categoryCheckbox} ${styles.categoryCheckboxInactive}`}>
                    [ ]
                  </span>
                  <div style={{
                    width: category.categoryWidth,
                    height: '11px',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: '1px',
                    display: 'inline-block',
                    marginLeft: '4px'
                  }}></div>
                </button>
                <span className={styles.tagCount}>[0]</span>
              </div>
            </div>
          ))}
        </div>

        {/* Auth Section Skeleton */}
        <div className={styles.authSection}>
          <div className={styles.authLogin}>
            <button className={styles.authButton} disabled>
              <span className={styles.authPrompt}>{">"}</span>
              <span className={styles.authButtonText}>LOGIN</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}