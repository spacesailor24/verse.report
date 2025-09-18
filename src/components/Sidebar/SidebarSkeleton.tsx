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
        {/* Filter header skeleton */}
        <div className={styles.filterHeader}>
          <div style={{
            width: '120px',
            height: '14px',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: '2px'
          }}></div>
          <div style={{
            width: '20px',
            height: '14px',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: '2px'
          }}></div>
        </div>

        {/* Category skeletons with fixed dimensions */}
        {[
          { categoryWidth: '80px', tagCount: 5, tagWidths: ['60px', '45px', '75px', '50px', '65px'] },
          { categoryWidth: '90px', tagCount: 4, tagWidths: ['55px', '70px', '40px', '80px'] },
          { categoryWidth: '70px', tagCount: 6, tagWidths: ['50px', '60px', '45px', '75px', '55px', '65px'] },
          { categoryWidth: '85px', tagCount: 3, tagWidths: ['70px', '50px', '60px'] },
          { categoryWidth: '75px', tagCount: 7, tagWidths: ['45px', '65px', '55px', '70px', '50px', '60px', '75px'] },
          { categoryWidth: '95px', tagCount: 4, tagWidths: ['65px', '50px', '80px', '55px'] }
        ].map((category, i) => (
          <div key={i} className={styles.category}>
            <div className={styles.categoryHeader}>
              <div style={{
                width: category.categoryWidth,
                height: '12px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: '2px'
              }}></div>
            </div>
            <div className={styles.categoryContent}>
              {category.tagWidths.map((width, j) => (
                <div key={j} className={styles.tag} style={{
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-secondary)',
                  color: 'transparent',
                  minHeight: '20px',
                  width: width
                }}>
                  &nbsp;
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}