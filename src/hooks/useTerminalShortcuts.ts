import { useEffect } from 'react'
import { useTerminalStore } from '../stores/terminalStore'

/** Toggle terminal panel with Ctrl/Cmd + ` (VS Code style). */
export function useTerminalShortcuts() {
  const togglePanel = useTerminalStore((s) => s.togglePanel)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isBacktick = event.key === '`' || event.code === 'Backquote'
      const withModifier = event.ctrlKey || event.metaKey
      if (!withModifier || !isBacktick) return

      event.preventDefault()
      togglePanel()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [togglePanel])
}
