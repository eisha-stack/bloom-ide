import { create } from 'zustand'
import { DEFAULT_OPENROUTER_MODEL } from '../lib/ai/openrouter'
import type { AIProviderId } from '../lib/ai'

const STORAGE_KEY = 'bloomcode-settings'

type SettingsState = {
  autoSave: boolean
  aiProviderId: AIProviderId
  openRouterApiKey: string
  openRouterModel: string
}

type SettingsStore = SettingsState & {
  setAutoSave: (enabled: boolean) => void
  setAiProviderId: (id: AIProviderId) => void
  setOpenRouterApiKey: (key: string) => void
  setOpenRouterModel: (model: string) => void
}

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SettingsState>
      return {
        autoSave: parsed.autoSave === true,
        aiProviderId: parsed.aiProviderId === 'openrouter' ? 'openrouter' : 'mock',
        openRouterApiKey: typeof parsed.openRouterApiKey === 'string' ? parsed.openRouterApiKey : '',
        openRouterModel:
          typeof parsed.openRouterModel === 'string' && parsed.openRouterModel.trim()
            ? parsed.openRouterModel
            : DEFAULT_OPENROUTER_MODEL,
      }
    }
  } catch {
    /* ignore */
  }

  return {
    autoSave: false,
    aiProviderId: 'mock',
    openRouterApiKey: '',
    openRouterModel: DEFAULT_OPENROUTER_MODEL,
  }
}

function persistSettings(state: SettingsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...loadSettings(),

  setAutoSave: (enabled) => {
    set({ autoSave: enabled })
    persistSettings(get())
  },

  setAiProviderId: (id) => {
    set({ aiProviderId: id })
    persistSettings(get())
  },

  setOpenRouterApiKey: (key) => {
    set({ openRouterApiKey: key })
    persistSettings(get())
  },

  setOpenRouterModel: (model) => {
    set({ openRouterModel: model })
    persistSettings(get())
  },
}))

export function useSettings() {
  const autoSave = useSettingsStore((s) => s.autoSave)
  const aiProviderId = useSettingsStore((s) => s.aiProviderId)
  const openRouterApiKey = useSettingsStore((s) => s.openRouterApiKey)
  const openRouterModel = useSettingsStore((s) => s.openRouterModel)
  const setAutoSave = useSettingsStore((s) => s.setAutoSave)
  const setAiProviderId = useSettingsStore((s) => s.setAiProviderId)
  const setOpenRouterApiKey = useSettingsStore((s) => s.setOpenRouterApiKey)
  const setOpenRouterModel = useSettingsStore((s) => s.setOpenRouterModel)

  return {
    autoSave,
    aiProviderId,
    openRouterApiKey,
    openRouterModel,
    setAutoSave,
    setAiProviderId,
    setOpenRouterApiKey,
    setOpenRouterModel,
    hasOpenRouterKey: openRouterApiKey.trim().length > 0,
  }
}

export function getAISettingsConfig() {
  const state = useSettingsStore.getState()
  return {
    aiProviderId: state.aiProviderId,
    openRouterApiKey: state.openRouterApiKey,
    openRouterModel: state.openRouterModel,
  }
}
