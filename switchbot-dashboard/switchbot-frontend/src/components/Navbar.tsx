import shared from '../styles/shared.module.css'
import styles from './Navbar.module.css'

interface NavbarProps {
  connected: boolean
}

export function Navbar({ connected }: NavbarProps) {
  return (
    <nav className={styles.navbar}>
      <a className={styles.brand} href="#">
        Temp Master Dashboard
      </a>
      <ul className={styles.nav}>
        <li className={styles.active}>
          <a href="/">Dashboard</a>
        </li>
      </ul>
      <div className={styles.status}>
        <span
          className={`${shared.label} ${connected ? shared.labelSuccess : shared.labelDanger}`}
        >
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </nav>
  )
}
