import type { ITheme } from '@xterm/xterm'
import type { ThemeDefinition } from '../../theme/types'

export function createXtermTheme(theme: ThemeDefinition): ITheme {
  const { tokens: t } = theme
  const isLight = theme.mode === 'light'

  return {
    background: t.bgEditor,
    foreground: t.textPrimary,
    cursor: t.accentPrimary,
    cursorAccent: t.bgEditor,
    selectionBackground: t.selectionBg,
    selectionForeground: t.textPrimary,
    black: isLight ? '#4A2B3D' : '#1B1826',
    red: t.error,
    green: t.success,
    yellow: t.warning,
    blue: t.bloomPurple,
    magenta: t.accentPrimary,
    cyan: t.bloomLavender,
    white: t.textPrimary,
    brightBlack: t.textMuted,
    brightRed: t.error,
    brightGreen: t.success,
    brightYellow: t.warning,
    brightBlue: t.bloomLilac,
    brightMagenta: t.accentSecondary,
    brightCyan: t.bloomLavender,
    brightWhite: t.textPrimary,
  }
}
