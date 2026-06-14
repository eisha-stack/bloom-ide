import { useEffect } from 'react'
import { useEditorStore } from '../stores/editorStore'

/** Global editor keyboard shortcuts (Ctrl/Cmd + S to save). */
export function useEditorShortcuts() {
  const saveActiveTab = useEditorStore((s) => s.saveActiveTab)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isSave = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's'
      if (!isSave) return

      event.preventDefault()
      void saveActiveTab()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [saveActiveTab])
}
