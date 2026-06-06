import type { FileNode } from '../types/ide'

export type EditorLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'json'
  | 'css'
  | 'markdown'
  | 'plaintext'

export type CursorPosition = {
  line: number
  column: number
}

export type EditorDocument = {
  id: string
  name: string
  language: EditorLanguage | string
  content: string
  isDirty: boolean
  cursor: CursorPosition
}

export type OpenDocumentInput = {
  id: string
  name: string
  language?: string
  content: string
}

export type EditorContextValue = {
  tabs: EditorDocument[]
  activeTabId: string | null
  activeTab: EditorDocument | null
  openFile: (node: FileNode, content?: string) => void
  openDocument: (doc: OpenDocumentInput) => void
  closeTab: (id: string) => void
  selectTab: (id: string) => void
  updateContent: (id: string, content: string) => void
  updateCursor: (line: number, column: number) => void
  markSaved: (id: string) => void
}
