import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { FileNode } from '../types/ide'
import { resolveLanguage } from './languageRegistry'
import type { EditorContextValue, EditorDocument, OpenDocumentInput } from './types'

const EditorContext = createContext<EditorContextValue | null>(null)

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

type EditorProviderProps = {
  children: ReactNode
  /** Resolve file content when opening from the tree (inject mock FS, API, etc.) */
  getFileContent?: (fileId: string, fileName: string) => string
}

export function EditorProvider({ children, getFileContent }: EditorProviderProps) {
  const [tabs, setTabs] = useState<EditorDocument[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? null,
    [tabs, activeTabId],
  )

  const openDocument = useCallback((input: OpenDocumentInput) => {
    setTabs((prev) => {
      const existing = prev.find((tab) => tab.id === input.id)
      if (existing) return prev
      return [...prev, createDocument(input)]
    })
    setActiveTabId(input.id)
  }, [])

  const openFile = useCallback(
    (node: FileNode, content?: string) => {
      if (node.type !== 'file') return

      const resolvedContent =
        content ??
        getFileContent?.(node.id, node.name) ??
        getDefaultContent(node.name)

      openDocument({
        id: node.id,
        name: node.name,
        language: node.language,
        content: resolvedContent,
      })
    },
    [getFileContent, openDocument],
  )

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const next = prev.filter((tab) => tab.id !== id)
        if (activeTabId === id) {
          const closedIndex = prev.findIndex((tab) => tab.id === id)
          const fallback = next[closedIndex] ?? next[closedIndex - 1] ?? null
          setActiveTabId(fallback?.id ?? null)
        }
        return next
      })
    },
    [activeTabId],
  )

  const selectTab = useCallback((id: string) => {
    setActiveTabId(id)
  }, [])

  const updateContent = useCallback((id: string, content: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, content, isDirty: true } : tab)),
    )
  }, [])

  const updateCursor = useCallback(
    (line: number, column: number) => {
      if (!activeTabId) return
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId ? { ...tab, cursor: { line, column } } : tab,
        ),
      )
    },
    [activeTabId],
  )

  const markSaved = useCallback((id: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, isDirty: false } : tab)),
    )
  }, [])

  const value = useMemo<EditorContextValue>(
    () => ({
      tabs,
      activeTabId,
      activeTab,
      openFile,
      openDocument,
      closeTab,
      selectTab,
      updateContent,
      updateCursor,
      markSaved,
    }),
    [
      tabs,
      activeTabId,
      activeTab,
      openFile,
      openDocument,
      closeTab,
      selectTab,
      updateContent,
      updateCursor,
      markSaved,
    ],
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used within EditorProvider')
  return ctx
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
