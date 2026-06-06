import type { ThemeDefinition, ThemeTokens } from './types'

export function tokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  return {
    '--bg-primary': tokens.bgPrimary,
    '--bg-secondary': tokens.bgSecondary,
    '--sidebar': tokens.sidebar,
    '--bg-main': tokens.bgPrimary,
    '--bg-sidebar': tokens.sidebar,
    '--bg-editor': tokens.bgEditor,
    '--bg-card': tokens.bgCard,
    '--accent-primary': tokens.accentPrimary,
    '--accent-secondary': tokens.accentSecondary,
    '--accent-pink-glow': tokens.accentPrimary,
    '--accent-purple-glow': tokens.accentPurple,
    '--text-primary': tokens.textPrimary,
    '--text-secondary': tokens.textSecondary,
    '--text-muted': tokens.textMuted,
    '--success': tokens.success,
    '--warning': tokens.warning,
    '--error': tokens.error,
    '--bloom-pink': tokens.bloomPink,
    '--bloom-blush': tokens.bloomBlush,
    '--bloom-lavender': tokens.bloomLavender,
    '--bloom-purple': tokens.bloomPurple,
    '--bloom-lilac': tokens.bloomLilac,
    '--border-subtle': tokens.borderSubtle,
    '--glass-bg': tokens.glassBg,
    '--nav-glass-bg': tokens.navGlassBg,
    '--shadow-soft': tokens.shadowSoft,
    '--shadow-glow': tokens.shadowGlow,
    '--grid-dot': tokens.gridDot,
    '--blob-pink': tokens.blobPink,
    '--blob-lavender': tokens.blobLavender,
    '--blob-purple': tokens.blobPurple,
    '--blob-blush': tokens.blobBlush,
    '--hover-bg': tokens.hoverBg,
    '--selection-bg': tokens.selectionBg,
  }
}

export function applyTheme(theme: ThemeDefinition) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme.id)
  root.setAttribute('data-mode', theme.mode)

  const vars = tokensToCssVars(theme.tokens)
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}
