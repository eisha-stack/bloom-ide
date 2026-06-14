import { create } from 'zustand'

const STORAGE_KEY = 'bloomcode-settings'

type SettingsState = {
  autoSave: boolean
}

type SettingsStore = SettingsState & {
  setAutoSave: (enabled: boolean) => void
}

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SettingsState>
      return { autoSave: parsed.autoSave === true }
    }
  } catch {
    /* ignore */
  }
  return { autoSave: false }
}

function persistSettings(state: SettingsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...loadSettings(),

  setAutoSave: (enabled) => {
    set({ autoSave: enabled })
    persistSettings({ autoSave: enabled })
  },
}))

export function useSettings() {
  const autoSave = useSettingsStore((s) => s.autoSave)
  const setAutoSave = useSettingsStore((s) => s.setAutoSave)
  return { autoSave, setAutoSave }
}
