export type EditorLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'json'
  | 'css'
  | 'html'
  | 'markdown'
  | 'plaintext'

export type CursorPosition = {
  line: number
  column: number
}

export type EditorSelection = {
  text: string
  startLine: number
  startColumn: number
  endLine: number
  endColumn: number
}

export type EditorDocument = {
  id: string
  name: string
  language: EditorLanguage | string
  content: string
  savedContent: string
  isDirty: boolean
  isWorkspaceFile: boolean
  cursor: CursorPosition
  selection: EditorSelection | null
}

export type OpenDocumentInput = {
  id: string
  name: string
  language?: string
  content: string
  isWorkspaceFile?: boolean
}
