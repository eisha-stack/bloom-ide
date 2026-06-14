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

export type EditorDocument = {
  id: string
  name: string
  language: EditorLanguage | string
  content: string
  savedContent: string
  isDirty: boolean
  isWorkspaceFile: boolean
  cursor: CursorPosition
}

export type OpenDocumentInput = {
  id: string
  name: string
  language?: string
  content: string
  isWorkspaceFile?: boolean
}
