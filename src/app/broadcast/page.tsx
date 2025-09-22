import Sidebar from '@/components/Sidebar/Sidebar';
import { MobileMenuProvider } from '@/contexts/MobileMenuContext';
import styles from './broadcast.module.css';

export default function BroadcastPage() {
  return (
    <MobileMenuProvider>
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.content}>
            <h1 className={styles.title}>BROADCAST_TRANSMISSION</h1>
            <div className={styles.placeholder}>
              <span className={styles.prompt}>&gt;</span>
              <span className={styles.message}>TRANSMISSION_EDITOR_LOADING...</span>
            </div>
          </div>
        </main>
      </div>
    </MobileMenuProvider>
  );
}