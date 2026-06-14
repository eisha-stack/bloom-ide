import { create } from 'zustand'
import type { ShellKind } from '../lib/tauri/terminal'

export type TerminalTab = {
  id: string
  sessionId: string | null
  title: string
  shell: ShellKind
  cwd?: string
}

type TerminalStore = {
  tabs: TerminalTab[]
  activeTabId: string | null
  panelOpen: boolean
  panelHeight: number
  defaultShell: ShellKind
  addTab: (shell?: ShellKind) => string
  closeTab: (id: string) => void
  selectTab: (id: string) => void
  setSessionId: (tabId: string, sessionId: string, cwd?: string) => void
  setTabTitle: (tabId: string, title: string) => void
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void
  setPanelHeight: (height: number) => void
  setDefaultShell: (shell: ShellKind) => void
}

const MIN_HEIGHT = 120
const MAX_HEIGHT_RATIO = 0.75
const DEFAULT_HEIGHT = 280

function clampHeight(height: number) {
  const max = typeof window !== 'undefined' ? window.innerHeight * MAX_HEIGHT_RATIO : 600
  return Math.min(Math.max(height, MIN_HEIGHT), max)
}

function createTabId() {
  return `term-${crypto.randomUUID()}`
}

function shellLabel(shell: ShellKind) {
  switch (shell) {
    case 'powershell':
      return 'PowerShell'
    case 'cmd':
      return 'CMD'
    case 'bash':
      return 'Bash'
  }
}

function defaultShellForPlatform(): ShellKind {
  return navigator.platform.toLowerCase().includes('win') ? 'powershell' : 'bash'
}

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  panelOpen: false,
  panelHeight: DEFAULT_HEIGHT,
  defaultShell: defaultShellForPlatform(),

  addTab: (shell) => {
    const resolvedShell = shell ?? get().defaultShell
    const id = createTabId()
    const tab: TerminalTab = {
      id,
      sessionId: null,
      title: shellLabel(resolvedShell),
      shell: resolvedShell,
    }

    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: id,
      panelOpen: true,
    }))

    return id
  },

  closeTab: (id) => {
    set((state) => {
      const nextTabs = state.tabs.filter((tab) => tab.id !== id)
      let nextActive = state.activeTabId

      if (state.activeTabId === id) {
        const index = state.tabs.findIndex((tab) => tab.id === id)
        const fallback = nextTabs[index] ?? nextTabs[index - 1] ?? null
        nextActive = fallback?.id ?? null
      }

      return {
        tabs: nextTabs,
        activeTabId: nextActive,
        panelOpen: nextTabs.length > 0 ? state.panelOpen : false,
      }
    })
  },

  selectTab: (id) => set({ activeTabId: id }),

  setSessionId: (tabId, sessionId, cwd) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, sessionId, cwd: cwd ?? tab.cwd } : tab,
      ),
    }))
  },

  setTabTitle: (tabId, title) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, title } : tab)),
    }))
  },

  setPanelOpen: (open) => set({ panelOpen: open }),

  togglePanel: () => {
    const { panelOpen, tabs, addTab } = get()
    if (!panelOpen && tabs.length === 0) {
      addTab()
      return
    }
    set({ panelOpen: !panelOpen })
  },

  setPanelHeight: (height) => set({ panelHeight: clampHeight(height) }),

  setDefaultShell: (shell) => set({ defaultShell: shell }),
}))

export function useTerminal() {
  const tabs = useTerminalStore((s) => s.tabs)
  const activeTabId = useTerminalStore((s) => s.activeTabId)
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null
  const panelOpen = useTerminalStore((s) => s.panelOpen)
  const panelHeight = useTerminalStore((s) => s.panelHeight)
  const defaultShell = useTerminalStore((s) => s.defaultShell)
  const addTab = useTerminalStore((s) => s.addTab)
  const closeTab = useTerminalStore((s) => s.closeTab)
  const selectTab = useTerminalStore((s) => s.selectTab)
  const setSessionId = useTerminalStore((s) => s.setSessionId)
  const setTabTitle = useTerminalStore((s) => s.setTabTitle)
  const setPanelOpen = useTerminalStore((s) => s.setPanelOpen)
  const togglePanel = useTerminalStore((s) => s.togglePanel)
  const setPanelHeight = useTerminalStore((s) => s.setPanelHeight)
  const setDefaultShell = useTerminalStore((s) => s.setDefaultShell)

  return {
    tabs,
    activeTabId,
    activeTab,
    panelOpen,
    panelHeight,
    defaultShell,
    addTab,
    closeTab,
    selectTab,
    setSessionId,
    setTabTitle,
    setPanelOpen,
    togglePanel,
    setPanelHeight,
    setDefaultShell,
  }
}
