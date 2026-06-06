import { DEFAULT_THEME_ID, getThemeById, THEMES } from './themes'
import { applyTheme } from './applyTheme'
import type { ThemeId } from './types'

const STORAGE_KEY = 'bloomcode-theme'

export function loadStoredThemeId(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && THEMES.some((t) => t.id === stored)) {
      return stored as ThemeId
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME_ID
}

/** Apply theme before React paint to avoid flash */
export function initTheme() {
  applyTheme(getThemeById(loadStoredThemeId()))
}
