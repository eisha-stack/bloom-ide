import { create } from 'zustand'
import { mockFileContents } from '../data/mockFileTree'
import { resolveLanguage } from '../editor/languageRegistry'
import type { EditorDocument, OpenDocumentInput } from '../editor/types'
import type { FileNode } from '../types/ide'

type EditorStore = {
  tabs: EditorDocument[]
  activeTabId: string | null
  openDocument: (input: OpenDocumentInput) => void
  openFile: (node: FileNode) => void
  closeTab: (id: string) => void
  selectTab: (id: string) => void
  updateContent: (id: string, content: string) => void
  updateCursor: (line: number, column: number) => void
  markSaved: (id: string) => void
}

function createDocument(input: OpenDocumentInput): EditorDocument {
  return {
    id: input.id,
    name: input.name,
    language: resolveLanguage(input.name, input.language),
    content: input.content,
    isDirty: false,
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

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

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
    })
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
        tab.id === id ? { ...tab, content, isDirty: true } : tab,
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
      tabs: get().tabs.map((tab) => (tab.id === id ? { ...tab, isDirty: false } : tab)),
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
  const openDocument = useEditorStore((s) => s.openDocument)
  const openFile = useEditorStore((s) => s.openFile)
  const closeTab = useEditorStore((s) => s.closeTab)
  const selectTab = useEditorStore((s) => s.selectTab)
  const updateContent = useEditorStore((s) => s.updateContent)
  const updateCursor = useEditorStore((s) => s.updateCursor)
  const markSaved = useEditorStore((s) => s.markSaved)

  return {
    tabs,
    activeTabId,
    activeTab,
    openDocument,
    openFile,
    closeTab,
    selectTab,
    updateContent,
    updateCursor,
    markSaved,
  }
}
