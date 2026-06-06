export type ThemeId = 'bloom-dark' | 'sakura-blossom'

export type ThemeMode = 'dark' | 'light'

export type ThemeTokens = {
  bgPrimary: string
  bgSecondary: string
  sidebar: string
  bgEditor: string
  bgCard: string
  accentPrimary: string
  accentSecondary: string
  accentPurple: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  success: string
  warning: string
  error: string
  bloomPink: string
  bloomBlush: string
  bloomLavender: string
  bloomPurple: string
  bloomLilac: string
  borderSubtle: string
  glassBg: string
  navGlassBg: string
  shadowSoft: string
  shadowGlow: string
  gridDot: string
  blobPink: string
  blobLavender: string
  blobPurple: string
  blobBlush: string
  hoverBg: string
  selectionBg: string
}

export type ThemeDefinition = {
  id: ThemeId
  name: string
  emoji: string
  description: string
  mode: ThemeMode
  tokens: ThemeTokens
  monacoThemeId: string
}
