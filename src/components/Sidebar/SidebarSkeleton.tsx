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
            'skeletonCategory1', // SHIPS
            'skeletonCategory2', // PATCHES
            'skeletonCategory3', // CREATURES
            'skeletonCategory4', // LOCATIONS
            'skeletonCategory5', // EVENTS
            'skeletonCategory6'  // FEATURES
          ].map((skeletonClass, i) => (
            <div key={i} className={styles.categoryGroup}>
              <div className={styles.categoryHeader}>
                <button className={styles.expandButton}>
                  <span className={styles.expandIcon}>{">"}</span>
                </button>
                <button className={styles.categoryButton}>
                  <span className={`${styles.categoryCheckbox} ${styles.categoryCheckboxInactive}`}>
                    [ ]
                  </span>
                  <div className={styles[skeletonClass]}></div>
                </button>
                <span className={styles.tagCount}>[0]</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}