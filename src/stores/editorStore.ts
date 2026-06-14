import { create } from 'zustand'
import { mockFileContents } from '../data/mockFileTree'
import { resolveLanguage } from '../editor/languageRegistry'
import type { EditorDocument, OpenDocumentInput } from '../editor/types'
import { isTauri, readFile, writeFile } from '../lib/tauri'
import type { FileNode } from '../types/ide'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type EditorStore = {
  tabs: EditorDocument[]
  activeTabId: string | null
  openingFileId: string | null
  openFileError: string | null
  savingTabId: string | null
  saveError: string | null
  saveStatus: SaveStatus
  openDocument: (input: OpenDocumentInput) => void
  openFile: (node: FileNode) => void
  openFileAsync: (node: FileNode) => Promise<void>
  clearOpenFileError: () => void
  clearSaveError: () => void
  saveTab: (id: string) => Promise<boolean>
  saveActiveTab: () => Promise<boolean>
  closeTab: (id: string) => void
  selectTab: (id: string) => void
  updateContent: (id: string, content: string) => void
  updateCursor: (line: number, column: number) => void
  markSaved: (id: string) => void
}

let saveStatusTimer: ReturnType<typeof setTimeout> | null = null

function createDocument(input: OpenDocumentInput): EditorDocument {
  return {
    id: input.id,
    name: input.name,
    language: resolveLanguage(input.name, input.language),
    content: input.content,
    savedContent: input.content,
    isDirty: false,
    isWorkspaceFile: input.isWorkspaceFile ?? false,
    cursor: { line: 1, column: 1 },
  }
}

function getDefaultContent(fileName: string): string {
  const lang = resolveLanguage(fileName)
  switch (lang) {
    case 'typescript':
      return `// ${fileName}\nexport {}\n`
    case 'javascript':
      return `// ${fileName}\nexport {}\n`
    case 'python':
      return `# ${fileName}\n\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()\n`
    case 'java':
      return `// ${fileName}\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n`
    default:
      return `// ${fileName}\n`
  }
}

function resolveFileContent(fileId: string, fileName: string): string {
  return mockFileContents[fileId] ?? getDefaultContent(fileName)
}

function fsErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: string }).message)
  }
  if (error instanceof Error) return error.message
  return 'Failed to save file.'
}

function setSaveStatus(set: (partial: Partial<EditorStore>) => void, status: SaveStatus) {
  if (saveStatusTimer) clearTimeout(saveStatusTimer)
  set({ saveStatus: status })
  if (status === 'saved') {
    saveStatusTimer = setTimeout(() => {
      set({ saveStatus: 'idle' })
      saveStatusTimer = null
    }, 2000)
  }
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  openingFileId: null,
  openFileError: null,
  savingTabId: null,
  saveError: null,
  saveStatus: 'idle',

  clearOpenFileError: () => set({ openFileError: null }),
  clearSaveError: () => set({ saveError: null, saveStatus: 'idle' }),

  openDocument: (input) => {
    const { tabs } = get()
    const exists = tabs.some((tab) => tab.id === input.id)
    if (exists) {
      set({ activeTabId: input.id })
      return
    }
    set({
      tabs: [...tabs, createDocument(input)],
      activeTabId: input.id,
    })
  },

  openFile: (node) => {
    if (node.type !== 'file') return
    get().openDocument({
      id: node.id,
      name: node.name,
      language: node.language,
      content: resolveFileContent(node.id, node.name),
      isWorkspaceFile: false,
    })
  },

  openFileAsync: async (node) => {
    if (node.type !== 'file') return

    const { tabs } = get()
    const exists = tabs.some((tab) => tab.id === node.id)
    if (exists) {
      set({ activeTabId: node.id, openFileError: null, openingFileId: null })
      return
    }

    set({ openingFileId: node.id, openFileError: null })

    try {
      const content = isTauri()
        ? await readFile(node.id)
        : resolveFileContent(node.id, node.name)

      get().openDocument({
        id: node.id,
        name: node.name,
        language: node.language,
        content,
        isWorkspaceFile: isTauri(),
      })
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: string }).message)
          : error instanceof Error
            ? error.message
            : 'Failed to open file.'

      set({ openFileError: message })
    } finally {
      set({ openingFileId: null })
    }
  },

  saveTab: async (id) => {
    const tab = get().tabs.find((t) => t.id === id)
    if (!tab || !tab.isDirty) return true
    if (get().savingTabId === id) return true

    if (!tab.isWorkspaceFile) {
      set({
        saveError: 'Demo files cannot be saved. Open a folder in the desktop app to edit real files.',
        saveStatus: 'error',
      })
      return false
    }

    if (!isTauri()) {
      set({
        saveError: 'Saving requires the BloomCode desktop app.',
        saveStatus: 'error',
      })
      return false
    }

    set({ savingTabId: id, saveError: null })
    setSaveStatus(set, 'saving')

    try {
      await writeFile(tab.id, tab.content)
      get().markSaved(id)
      set({ savingTabId: null })
      setSaveStatus(set, 'saved')
      return true
    } catch (error) {
      const message = fsErrorMessage(error)
      set({ savingTabId: null, saveError: message })
      setSaveStatus(set, 'error')
      return false
    }
  },

  saveActiveTab: async () => {
    const { activeTabId } = get()
    if (!activeTabId) return false
    return get().saveTab(activeTabId)
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get()
    const next = tabs.filter((tab) => tab.id !== id)
    let nextActive = activeTabId

    if (activeTabId === id) {
      const closedIndex = tabs.findIndex((tab) => tab.id === id)
      const fallback = next[closedIndex] ?? next[closedIndex - 1] ?? null
      nextActive = fallback?.id ?? null
    }

    set({ tabs: next, activeTabId: nextActive })
  },

  selectTab: (id) => set({ activeTabId: id }),

  updateContent: (id, content) => {
    set({
      tabs: get().tabs.map((tab) =>
        tab.id === id
          ? { ...tab, content, isDirty: tab.savedContent !== content }
          : tab,
      ),
    })
  },

  updateCursor: (line, column) => {
    const { activeTabId, tabs } = get()
    if (!activeTabId) return
    set({
      tabs: tabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, cursor: { line, column } } : tab,
      ),
    })
  },

  markSaved: (id) => {
    set({
      tabs: get().tabs.map((tab) =>
        tab.id === id ? { ...tab, isDirty: false, savedContent: tab.content } : tab,
      ),
    })
  },
}))

export function useActiveTab() {
  return useEditorStore((state) => {
    if (!state.activeTabId) return null
    return state.tabs.find((tab) => tab.id === state.activeTabId) ?? null
  })
}

export function useEditor() {
  const tabs = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const activeTab = useActiveTab()
  const openingFileId = useEditorStore((s) => s.openingFileId)
  const openFileError = useEditorStore((s) => s.openFileError)
  const savingTabId = useEditorStore((s) => s.savingTabId)
  const saveError = useEditorStore((s) => s.saveError)
  const saveStatus = useEditorStore((s) => s.saveStatus)
  const openDocument = useEditorStore((s) => s.openDocument)
  const openFile = useEditorStore((s) => s.openFile)
  const openFileAsync = useEditorStore((s) => s.openFileAsync)
  const clearOpenFileError = useEditorStore((s) => s.clearOpenFileError)
  const clearSaveError = useEditorStore((s) => s.clearSaveError)
  const saveTab = useEditorStore((s) => s.saveTab)
  const saveActiveTab = useEditorStore((s) => s.saveActiveTab)
  const closeTab = useEditorStore((s) => s.closeTab)
  const selectTab = useEditorStore((s) => s.selectTab)
  const updateContent = useEditorStore((s) => s.updateContent)
  const updateCursor = useEditorStore((s) => s.updateCursor)
  const markSaved = useEditorStore((s) => s.markSaved)

  return {
    tabs,
    activeTabId,
    activeTab,
    openingFileId,
    openFileError,
    savingTabId,
    saveError,
    saveStatus,
    openDocument,
    openFile,
    openFileAsync,
    clearOpenFileError,
    clearSaveError,
    saveTab,
    saveActiveTab,
    closeTab,
    selectTab,
    updateContent,
    updateCursor,
    markSaved,
  }
}
