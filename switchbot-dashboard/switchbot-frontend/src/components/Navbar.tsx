import styles from './Navbar.module.css';
import ui from './ui.module.css';

interface NavbarProps {
  connected: boolean;
}

export function Navbar({ connected }: NavbarProps) {
  return (
    <nav className={styles.navbar}>
      <a className={styles.brand} href="#">
        Temp Master Dashboard
      </a>
      <ul className={styles.nav}>
        <li>
          <a className={`${styles.navLink} ${styles.navLinkActive}`} href="/">
            Dashboard
          </a>
        </li>
      </ul>
      <div className={styles.status}>
        <span
          data-testid="connection-status"
          className={`${ui.label} ${connected ? ui.labelSuccess : ui.labelDanger}`}
        >
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </nav>
  );
}
