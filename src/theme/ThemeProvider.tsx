import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { applyTheme } from './applyTheme'
import { loadStoredThemeId } from './initTheme'
import { getThemeById, THEMES } from './themes'
import type { ThemeDefinition, ThemeId } from './types'

const STORAGE_KEY = 'bloomcode-theme'

type ThemeContextValue = {
  theme: ThemeDefinition
  themeId: ThemeId
  setThemeId: (id: ThemeId) => void
  themes: ThemeDefinition[]
  monacoThemeId: string
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(loadStoredThemeId)
  const theme = useMemo(() => getThemeById(themeId), [themeId])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({
      theme,
      themeId,
      setThemeId,
      themes: THEMES,
      monacoThemeId: theme.monacoThemeId,
    }),
    [theme, themeId, setThemeId],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
