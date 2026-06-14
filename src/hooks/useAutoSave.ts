import { useEffect } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useSettingsStore } from '../stores/settingsStore'

const AUTO_SAVE_DELAY_MS = 1500

/** Debounced auto-save for dirty workspace files when the setting is enabled. */
export function useAutoSave() {
  const autoSave = useSettingsStore((s) => s.autoSave)
  const tabs = useEditorStore((s) => s.tabs)
  const saveTab = useEditorStore((s) => s.saveTab)

  useEffect(() => {
    if (!autoSave) return undefined

    const timers = new Map<string, ReturnType<typeof setTimeout>>()

    for (const tab of tabs) {
      if (!tab.isWorkspaceFile || !tab.isDirty) continue

      const existing = timers.get(tab.id)
      if (existing) clearTimeout(existing)

      timers.set(
        tab.id,
        setTimeout(() => {
          void saveTab(tab.id)
        }, AUTO_SAVE_DELAY_MS),
      )
    }

    return () => {
      for (const timer of timers.values()) clearTimeout(timer)
    }
  }, [autoSave, tabs, saveTab])
}
