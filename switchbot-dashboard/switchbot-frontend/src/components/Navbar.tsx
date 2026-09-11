import { useTheme } from '../theme/ThemeContext'
import { isThemeId, THEMES } from '../theme/themes'
import styles from './Navbar.module.css'
import shared from './shared.module.css'

interface NavbarProps {
  connected: boolean
}

export function Navbar({ connected }: NavbarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <nav className={styles.navbar}>
      <a className={styles.brand} href="#">
        Temp Master Dashboard
      </a>
      <ul className={styles.nav}>
        <li>
          <a className={styles.navLink} href="/">
            Dashboard
          </a>
        </li>
      </ul>
      <div className={styles.right}>
        <label className={styles.themeLabel} htmlFor="theme-select">
          Theme
        </label>
        <select
          id="theme-select"
          className={shared.select}
          value={theme}
          onChange={(e) => {
            if (isThemeId(e.target.value)) setTheme(e.target.value)
          }}
        >
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <span
          id="connection-status"
          className={`${shared.badge} ${connected ? shared.badgeSuccess : shared.badgeDanger}`}
        >
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </nav>
  )
}
